import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listUsers, updateUserRole } from '../controllers/user.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', listUsers);
router.put('/:id/role', updateUserRole);

export default router;
