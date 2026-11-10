import {
  findPatientById,
  listHospitals,
  listPatients,
  listRecordsMetadata
} from '../repositories/dataStore.js';
import { logPlatformActivity } from '../services/auditLogService.js';

export async function listAllDemoPatients(req, res, next) {
  try {
    const query = String(req.query.q || '').trim().toUpperCase();
    const patients = await listPatients();
    const allMeta = await listRecordsMetadata();

    const filtered = query
      ? patients.filter(
          (p) =>
            p.patientId.toUpperCase().includes(query) ||
            p.fullName.toUpperCase().includes(query)
        )
      : patients;

    const enriched = filtered.map((p) => {
      const patientRecords = allMeta.filter((r) => r.patientId === p.patientId);
      const hospitalNames = [...new Set(patientRecords.map((r) => r.hospitalName))];
      return {
        ...p,
        totalRecordsAvailable: patientRecords.length,
        hospitalCount: hospitalNames.length,
        hospitals: hospitalNames
      };
    });

    return res.status(200).json({
      success: true,
      isDemo: true,
      patients: enriched
    });
  } catch (error) {
    return next(error);
  }
}

export async function searchPatientByAbhaId(req, res, next) {
  try {
    const rawId = req.params.patientId || req.query.abhaId || '';
    const patientId = String(rawId).trim().toUpperCase();

    if (!patientId) {
      return res.status(400).json({
        success: false,
        code: 'PATIENT_ID_REQUIRED',
        message: 'Please enter a fictional ABHA-style ID (e.g., DEMO-ABHA-1001).'
      });
    }

    const patient = await findPatientById(patientId);
    if (!patient) {
      await logPlatformActivity({
        actor: req.user,
        patientId,
        hospitalSource: 'Patient Registry Index',
        action: 'PATIENT_SEARCH_NOT_FOUND',
        summary: `Searched for unknown fictional ID ${patientId}`
      });

      return res.status(404).json({
        success: false,
        code: 'PATIENT_NOT_FOUND',
        message: `No synthetic patient found matching "${patientId}". Try DEMO-ABHA-1001 through DEMO-ABHA-1005.`
      });
    }

    const [hospitals, patientMeta] = await Promise.all([
      listHospitals(),
      listRecordsMetadata(patientId)
    ]);

    // Group available record metadata by hospital during initial discovery
    const hospitalAvailability = hospitals
      .map((hosp) => {
        const matches = patientMeta.filter((m) => m.hospitalId === hosp.hospitalId);
        const categories = [...new Set(matches.map((m) => m.category))];
        return {
          hospitalId: hosp.hospitalId,
          slug: hosp.slug,
          hospitalName: hosp.name,
          location: hosp.location,
          isEnabled: hosp.isEnabled,
          systemStatus: hosp.systemStatus,
          availableRecordCount: matches.length,
          reportCategories: categories
        };
      })
      .filter((h) => h.availableRecordCount > 0);

    if (req.query.logSearch !== 'false') {
      await logPlatformActivity({
        actor: req.user,
        patientId,
        hospitalSource: 'Patient Discovery Index',
        action: 'PATIENT_SEARCH',
        summary: `Discovered ${patientMeta.length} record reference(s) across ${hospitalAvailability.length} hospital(s)`
      });
    }

    return res.status(200).json({
      success: true,
      isDemo: true,
      patient,
      totalAvailableReports: patientMeta.length,
      availableHospitals: hospitalAvailability
    });
  } catch (error) {
    return next(error);
  }
}

