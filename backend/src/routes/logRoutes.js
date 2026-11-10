import { Router } from 'express';
import { getAccessLogs } from '../controllers/logController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateUser, getAccessLogs);

export default router;

