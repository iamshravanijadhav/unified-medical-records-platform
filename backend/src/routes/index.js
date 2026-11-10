import { Router } from 'express';
import { getFirebaseState } from '../config/firebaseAdmin.js';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import hospitalGatewayRoutes from './hospitalGatewayRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import logRoutes from './logRoutes.js';
import patientRoutes from './patientRoutes.js';
import recordRoutes from './recordRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  const fb = getFirebaseState();
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'Unified Medical Records Access Platform API',
    mode: fb.mode,
    firebaseConfigured: fb.firebaseConfigured,
    modeDescription: fb.initMessage,
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/hospitals', hospitalGatewayRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/patients', patientRoutes);
router.use('/records', recordRoutes);
router.use('/logs', logRoutes);
router.use('/settings', settingsRoutes);

export default router;

