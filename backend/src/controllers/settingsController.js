import { getFirebaseState } from '../config/firebaseAdmin.js';
import { listHospitals, resetDemoStore } from '../repositories/dataStore.js';

export async function getSettingsStatus(req, res, next) {
  try {
    const fb = getFirebaseState();
    const hospitals = await listHospitals();

    return res.status(200).json({
      success: true,
      platform: {
        name: 'Unified Medical Records Access Platform',
        stage: 'College MVP (Synthetic Demo Data)',
        mode: fb.mode,
        firebaseConfigured: fb.firebaseConfigured,
        modeDescription: fb.initMessage
      },
      architectureReadiness: {
        abdmGateway: 'Not Active in MVP (Real-world production deployment requires patient authorization, privacy safeguards & ABDM integration)',
        fhirAdapterLayer: 'Active (Schema normalization adapters map HIS JSON -> FHIR-inspired structure)',
        hospitalEndpoints: hospitals.map((h) => ({
          hospitalId: h.hospitalId,
          name: h.name,
          endpoint: h.apiEndpoint,
          isEnabled: h.isEnabled,
          systemStatus: h.systemStatus
        }))
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function resetDemoData(req, res, next) {
  try {
    const result = await resetDemoStore();
    return res.status(200).json({
      success: true,
      message: 'Local demo synthetic dataset has been reset to initial state.',
      ...result
    });
  } catch (error) {
    error.statusCode = 400;
    return next(error);
  }
}

