import { Router } from 'express';
import { getHospitalPatientRecords } from '../controllers/hospitalApiController.js';
import { authenticateHospitalGateway } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * Independent Demo Hospital Microservice Endpoints:
 * - GET /api/hospitals/sunrise/records/:patientId
 * - GET /api/hospitals/citycare/records/:patientId
 * - GET /api/hospitals/aarogya/records/:patientId
 * - GET /api/hospitals/:slug/records/:patientId
 */
router.get('/:slug/records/:patientId', authenticateHospitalGateway, getHospitalPatientRecords);

export default router;

