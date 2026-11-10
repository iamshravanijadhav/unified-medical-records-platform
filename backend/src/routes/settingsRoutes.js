import { Router } from 'express';
import { getSettingsStatus, resetDemoData } from '../controllers/settingsController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/status', authenticateUser, getSettingsStatus);
router.post('/reset-demo', authenticateUser, resetDemoData);

export default router;

