import { aarogyaNativeRecords } from '../data/hospitals/aarogyaRecords.js';
import { citycareNativeRecords } from '../data/hospitals/citycareRecords.js';
import { sunriseNativeRecords } from '../data/hospitals/sunriseRecords.js';
import { findHospitalBySlug, getCustomHospitalRecords } from '../repositories/dataStore.js';

/**
 * Serves separate, independent hospital REST API endpoints:
 * - GET /api/hospitals/sunrise/records/:patientId
 * - GET /api/hospitals/citycare/records/:patientId
 * - GET /api/hospitals/aarogya/records/:patientId
 * - GET /api/hospitals/:slug/records/:patientId
 */
export async function getHospitalPatientRecords(req, res, next) {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const patientId = String(req.params.patientId || '').trim().toUpperCase();

    const hospital = await findHospitalBySlug(slug);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        code: 'HOSPITAL_ENDPOINT_NOT_FOUND',
        message: `Demo hospital node "${slug}" is not registered.`
      });
    }

    // Simulate real hospital gateway outage or disabled integration
    if (!hospital.isEnabled) {
      return res.status(503).json({
        success: false,
        code: 'HOSPITAL_CONNECTION_DISABLED',
        hospitalId: hospital.hospitalId,
        hospitalName: hospital.name,
        message: `${hospital.name} exchange connector is currently disabled.`
      });
    }

    if (hospital.systemStatus === 'offline') {
      return res.status(503).json({
        success: false,
        code: 'HOSPITAL_GATEWAY_OFFLINE',
        hospitalId: hospital.hospitalId,
        hospitalName: hospital.name,
        message: `${hospital.name} HIS API gateway is offline or unreachable (simulated outage).`
      });
    }

    let records = [];
    let schemaFormat = 'custom-his-v1';

    if (slug === 'sunrise') {
      schemaFormat = 'sunrise-his-v2';
      records = sunriseNativeRecords.filter((r) => r.abha_ref.toUpperCase() === patientId);
    } else if (slug === 'citycare') {
      schemaFormat = 'citycare-ehr-v1';
      records = citycareNativeRecords.filter((r) => r.patientIdentifier.toUpperCase() === patientId);
    } else if (slug === 'aarogya') {
      schemaFormat = 'aarogya-pacs-lis-v3';
      records = aarogyaNativeRecords.filter((r) => r.abhaId.toUpperCase() === patientId);
    } else {
      schemaFormat = 'generic-demo-his-v1';
      records = getCustomHospitalRecords(slug).filter((r) => String(r.patientId).toUpperCase() === patientId);
    }

    return res.status(200).json({
      success: true,
      isDemoEndpoint: true,
      hospitalId: hospital.hospitalId,
      hospitalName: hospital.name,
      schemaFormat,
      patientId,
      recordCount: records.length,
      records,
      respondedAt: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
}

