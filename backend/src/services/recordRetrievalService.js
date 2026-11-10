import {
  findPatientById,
  listHospitals
} from '../repositories/dataStore.js';
import { fetchFromHospitalApi } from './hospitalConnectorService.js';
import { logPlatformActivity } from './auditLogService.js';

/**
 * Central Medical Record Retrieval Engine
 * Orchestrates doctor authorization, multi-hospital HTTP requests,
 * outage handling, schema normalization, chronological sorting, and audit logging.
 */
export async function executeCombinedRecordFetch({ doctor, patientId }) {
  const normalizedPatientId = String(patientId || '').trim().toUpperCase();

  // 1. Validate patient exists
  const patient = await findPatientById(normalizedPatientId);
  if (!patient) {
    const error = new Error(`No synthetic patient found with identifier "${normalizedPatientId}".`);
    error.statusCode = 404;
    error.code = 'PATIENT_NOT_FOUND';
    throw error;
  }

  // 2. Load registered hospitals
  const hospitals = await listHospitals();
  const enabledHospitals = hospitals.filter((h) => h.isEnabled);
  const disabledHospitals = hospitals.filter((h) => !h.isEnabled);

  // 3. Contact enabled hospital REST APIs in parallel via real HTTP calls
  const hospitalResults = await Promise.all(
    enabledHospitals.map((hospital) => fetchFromHospitalApi(hospital, normalizedPatientId))
  );

  // 4. Partition successful vs unavailable/disabled hospitals
  const successfulHospitals = [];
  const unavailableHospitals = [];
  const combinedRecords = [];

  for (const res of hospitalResults) {
    if (res.ok) {
      successfulHospitals.push({
        hospitalId: res.hospitalId,
        hospitalSlug: res.hospitalSlug,
        hospitalName: res.hospitalName,
        endpoint: res.endpoint,
        recordsRetrieved: res.recordCount,
        latencyMs: res.latencyMs,
        status: 'online'
      });
      combinedRecords.push(...res.records);
    } else {
      unavailableHospitals.push({
        hospitalId: res.hospitalId,
        hospitalSlug: res.hospitalSlug,
        hospitalName: res.hospitalName,
        endpoint: res.endpoint,
        statusCode: res.statusCode,
        status: 'unavailable',
        errorMessage: res.error
      });
    }
  }

  for (const disabled of disabledHospitals) {
    unavailableHospitals.push({
      hospitalId: disabled.hospitalId,
      hospitalSlug: disabled.slug,
      hospitalName: disabled.name,
      endpoint: disabled.apiEndpoint,
      statusCode: 503,
      status: 'disabled',
      errorMessage: 'Hospital connection is disabled by Hospital Administrator'
    });
  }

  // 5. Sort combined records chronologically (newest first)
  combinedRecords.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));

  const retrievedAt = new Date().toISOString();

  // Log retrieval activity
  const sourceNames = successfulHospitals.map((h) => h.hospitalName).join(', ') || 'None Available';
  await logPlatformActivity({
    actor: doctor,
    patientId: normalizedPatientId,
    hospitalSource: sourceNames,
    action: 'RECORDS_FETCHED',
    summary: `Retrieved ${combinedRecords.length} record(s) across ${successfulHospitals.length} online hospital(s); ${unavailableHospitals.length} unavailable/disabled`
  });

  return {
    isDemo: true,
    patient,
    summary: {
      totalRecords: combinedRecords.length,
      successfulHospitals,
      unavailableHospitals,
      retrievedAt
    },
    records: combinedRecords
  };
}

