import { Router } from 'express';
import authRoutes from './authRoutes.js';
import clientRoutes from './clientRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import taskRoutes from './taskRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import statsRoutes from './statsRoutes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/tasks', taskRoutes);
router.use('/employees', employeeRoutes);
router.use('/stats', statsRoutes);

export default router;
