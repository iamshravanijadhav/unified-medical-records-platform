import { Router } from 'express';
import { fetchCombinedPatientRecords } from '../controllers/recordController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { requireFields } from '../middleware/validateMiddleware.js';

const router = Router();

router.post(
  '/fetch',
  authenticateUser,
  requireRole('doctor'),
  requireFields(['patientId']),
  fetchCombinedPatientRecords
);

export default router;

