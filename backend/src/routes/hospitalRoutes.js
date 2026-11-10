import { Router } from 'express';
import {
  editHospital,
  getHospitals,
  getHospitalSharedRecords,
  registerHospital,
  toggleHospitalStatus
} from '../controllers/hospitalController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { requireFields } from '../middleware/validateMiddleware.js';

const router = Router();

router.get('/', authenticateUser, getHospitals);
router.post(
  '/',
  authenticateUser,
  requireRole('hospital_admin'),
  requireFields(['name', 'location']),
  registerHospital
);
router.put(
  '/:hospitalId',
  authenticateUser,
  requireRole('hospital_admin'),
  editHospital
);
router.patch(
  '/:hospitalId/status',
  authenticateUser,
  requireRole('hospital_admin'),
  toggleHospitalStatus
);
router.get(
  '/:hospitalId/shared-records',
  authenticateUser,
  getHospitalSharedRecords
);

export default router;

