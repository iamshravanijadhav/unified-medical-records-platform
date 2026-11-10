import { Router } from 'express';
import { listAllDemoPatients, searchPatientByAbhaId } from '../controllers/patientController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateUser, listAllDemoPatients);
router.get('/search', authenticateUser, searchPatientByAbhaId);
router.get('/:patientId', authenticateUser, searchPatientByAbhaId);

export default router;

