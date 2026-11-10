import { env, getInternalBaseUrl } from '../config/env.js';

/**
 * FHIR-inspired normalization adapters.
 * Each hospital returns its own native JSON schema; these adapters map
 * heterogeneous vendor formats into a single unified exchange model.
 * In future production deployments, these adapters can map HL7 FHIR R4 Bundles.
 */
function normalizeSunriseRecord(raw, hospital) {
  return {
    recordId: raw.record_id,
    patientId: raw.abha_ref,
    hospitalId: hospital.hospitalId,
    hospitalSlug: hospital.slug,
    hospitalName: hospital.name,
    title: raw.doc_title,
    category: raw.doc_type,
    reportDate: raw.issued_at,
    doctorName: raw.physician,
    department: raw.department || 'General',
    fileFormat: raw.file_type || 'PDF',
    findingsSummary: raw.findings_summary || '',
    fhirResourceType: raw.doc_type === 'Prescriptions' ? 'MedicationRequest' : 'DocumentReference',
    vitals: raw.vitals || null,
    labTable: Array.isArray(raw.labTable) ? raw.labTable : null,
    medications: Array.isArray(raw.medications) ? raw.medications : null,
    sections: Array.isArray(raw.sections) ? raw.sections : [],
    isDemo: true
  };
}

function normalizeCitycareRecord(raw, hospital) {
  return {
    recordId: raw.entryId,
    patientId: raw.patientIdentifier,
    hospitalId: hospital.hospitalId,
    hospitalSlug: hospital.slug,
    hospitalName: hospital.name,
    title: raw.reportTitle,
    category: raw.categoryCode,
    reportDate: raw.visitDate,
    doctorName: raw.clinicianName,
    department: raw.unit || 'Outpatient',
    fileFormat: raw.attachmentType || 'PDF',
    findingsSummary: raw.summaryText || '',
    fhirResourceType: raw.categoryCode === 'Prescriptions' ? 'MedicationRequest' : 'DocumentReference',
    vitals: raw.vitals || null,
    labTable: Array.isArray(raw.labTable) ? raw.labTable : null,
    medications: Array.isArray(raw.medications) ? raw.medications : null,
    sections: Array.isArray(raw.sections) ? raw.sections : [],
    isDemo: true
  };
}

function normalizeAarogyaRecord(raw, hospital) {
  return {
    recordId: raw.labRef,
    patientId: raw.abhaId,
    hospitalId: hospital.hospitalId,
    hospitalSlug: hospital.slug,
    hospitalName: hospital.name,
    title: raw.testName,
    category: raw.modality,
    reportDate: raw.reportTimestamp,
    doctorName: raw.pathologist,
    department: raw.labSection || 'Diagnostics',
    fileFormat: raw.format || 'PDF',
    findingsSummary: raw.findings_summary || '',
    fhirResourceType: 'DiagnosticReport',
    vitals: raw.vitals || null,
    labTable: Array.isArray(raw.labTable) ? raw.labTable : null,
    medications: Array.isArray(raw.medications) ? raw.medications : null,
    sections: Array.isArray(raw.sections) ? raw.sections : [],
    isDemo: true
  };
}

function normalizeGenericHospitalRecord(raw, hospital) {
  return {
    recordId: raw.recordId || raw.id,
    patientId: raw.patientId,
    hospitalId: hospital.hospitalId,
    hospitalSlug: hospital.slug,
    hospitalName: hospital.name,
    title: raw.title,
    category: raw.category || 'Other Medical Documents',
    reportDate: raw.reportDate,
    doctorName: raw.doctorName || 'Attending Physician',
    department: raw.department || 'General',
    fileFormat: raw.fileFormat || 'PDF',
    findingsSummary: raw.findingsSummary || '',
    fhirResourceType: 'DocumentReference',
    vitals: raw.vitals || null,
    labTable: Array.isArray(raw.labTable) ? raw.labTable : null,
    medications: Array.isArray(raw.medications) ? raw.medications : null,
    sections: Array.isArray(raw.sections) ? raw.sections : [],
    isDemo: true
  };
}

export function normalizeHospitalRecords(slug, rawRecords, hospital) {
  const list = Array.isArray(rawRecords) ? rawRecords : [];
  if (slug === 'sunrise') return list.map((r) => normalizeSunriseRecord(r, hospital));
  if (slug === 'citycare') return list.map((r) => normalizeCitycareRecord(r, hospital));
  if (slug === 'aarogya') return list.map((r) => normalizeAarogyaRecord(r, hospital));
  return list.map((r) => normalizeGenericHospitalRecord(r, hospital));
}

/**
 * Makes an actual HTTP REST call from the central retrieval engine
 * to an individual hospital microservice endpoint.
 */
export async function fetchFromHospitalApi(hospital, patientId) {
  const startedAt = Date.now();
  const baseUrl = getInternalBaseUrl();
  const endpointPath = `/api/hospitals/${encodeURIComponent(hospital.slug)}/records/${encodeURIComponent(patientId)}`;
  const targetUrl = `${baseUrl}${endpointPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-exchange-key': env.exchangeGatewayKey,
        'x-requested-patient': patientId
      },
      signal: AbortSignal.timeout(4000)
    });

    const latencyMs = Date.now() - startedAt;
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        hospitalId: hospital.hospitalId,
        hospitalSlug: hospital.slug,
        hospitalName: hospital.name,
        endpoint: endpointPath,
        statusCode: response.status,
        latencyMs,
        error: payload.message || `Hospital API responded with HTTP ${response.status}`,
        records: []
      };
    }

    const normalized = normalizeHospitalRecords(hospital.slug, payload.records, hospital);

    return {
      ok: true,
      hospitalId: hospital.hospitalId,
      hospitalSlug: hospital.slug,
      hospitalName: hospital.name,
      endpoint: endpointPath,
      schemaFormat: payload.schemaFormat || 'custom-his-v1',
      statusCode: response.status,
      latencyMs,
      recordCount: normalized.length,
      records: normalized
    };
  } catch (err) {
    return {
      ok: false,
      hospitalId: hospital.hospitalId,
      hospitalSlug: hospital.slug,
      hospitalName: hospital.name,
      endpoint: endpointPath,
      statusCode: 503,
      latencyMs: Date.now() - startedAt,
      error: err.name === 'TimeoutError'
        ? 'Hospital API request timed out after 4000ms'
        : `Unable to reach hospital endpoint: ${err.message}`,
      records: []
    };
  }
}

