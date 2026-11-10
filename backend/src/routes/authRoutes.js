import { Router } from 'express';
import {
  getCurrentUser,
  getDemoModeInfo,
  loginUser,
  registerUser,
  updateCurrentUser
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validateMiddleware.js';

const router = Router();

router.get('/demo-info', getDemoModeInfo);
router.post('/register', requireFields(['name', 'email']), registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateUser, getCurrentUser);
router.put('/me', authenticateUser, updateCurrentUser);

export default router;

