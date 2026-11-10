import {
  listAccessLogs,
  listHospitals,
  listPatients,
  listRecordsMetadata
} from '../repositories/dataStore.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const [hospitals, patients, recordsMeta, logs] = await Promise.all([
      listHospitals(),
      listPatients(),
      listRecordsMetadata(),
      listAccessLogs()
    ]);

    const connectedHospitals = hospitals.filter((h) => h.isEnabled);
    const onlineHospitals = connectedHospitals.filter((h) => h.systemStatus === 'online');

    // Compute distinct patients searched or accessed
    const searchedPatientIds = new Set(
      logs
        .filter((l) => ['PATIENT_SEARCH', 'RECORDS_FETCHED'].includes(l.action))
        .map((l) => l.patientId)
        .filter((id) => id && id !== 'N/A')
    );

    const totalRecordRetrievals = logs.filter((l) => l.action === 'RECORDS_FETCHED').length;

    // Category distribution
    const categoryCountsMap = {};
    for (const r of recordsMeta) {
      categoryCountsMap[r.category] = (categoryCountsMap[r.category] || 0) + 1;
    }
    const recordsByCategory = Object.entries(categoryCountsMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Hospital distribution
    const hospitalCountsMap = {};
    for (const h of hospitals) {
      hospitalCountsMap[h.name] = 0;
    }
    for (const r of recordsMeta) {
      hospitalCountsMap[r.hospitalName] = (hospitalCountsMap[r.hospitalName] || 0) + 1;
    }
    const recordsByHospital = Object.entries(hospitalCountsMap).map(([hospitalName, count]) => ({
      hospitalName,
      count
    }));

    // Recent patient searches (deduplicated most recent)
    const recentSearches = [];
    const seenSearch = new Set();
    for (const log of logs) {
      if (
        ['PATIENT_SEARCH', 'RECORDS_FETCHED'].includes(log.action) &&
        log.patientId &&
        log.patientId !== 'N/A' &&
        !seenSearch.has(log.patientId)
      ) {
        seenSearch.add(log.patientId);
        const patientObj = patients.find((p) => p.patientId === log.patientId);
        recentSearches.push({
          patientId: log.patientId,
          patientName: patientObj?.fullName || 'Demo Patient',
          lastAction: log.action,
          hospitalCount: new Set(
            recordsMeta.filter((r) => r.patientId === log.patientId).map((r) => r.hospitalId)
          ).size,
          reportCount: recordsMeta.filter((r) => r.patientId === log.patientId).length,
          timestamp: log.timestamp
        });
      }
      if (recentSearches.length >= 5) break;
    }

    return res.status(200).json({
      success: true,
      isDemoData: true,
      kpis: {
        totalPatientsSearched: searchedPatientIds.size,
        totalDemoPatients: patients.length,
        totalRegisteredHospitals: hospitals.length,
        totalConnectedHospitals: connectedHospitals.length,
        totalOnlineHospitals: onlineHospitals.length,
        totalAvailableRecords: recordsMeta.length,
        totalRecordRetrievals
      },
      recentSearches,
      recentActivity: logs.slice(0, 8),
      recordsByCategory,
      recordsByHospital,
      hospitals
    });
  } catch (error) {
    return next(error);
  }
}

