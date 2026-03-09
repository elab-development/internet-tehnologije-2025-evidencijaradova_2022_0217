import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getAdminStats } from '../controllers/adminStats.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics (admin only)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdminStatsResponse' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/stats', getAdminStats);

export default router;