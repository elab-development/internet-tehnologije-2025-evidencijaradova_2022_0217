import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getAdminStats } from '../controllers/adminStats.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/stats', getAdminStats);

export default router;