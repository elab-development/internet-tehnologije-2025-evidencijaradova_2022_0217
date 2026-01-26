import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createWork,
  listWorks,
  getWorkById,
  updateWork,
  deleteWork,
} from '../controllers/work.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('student'), upload.single('file'), createWork);

router.get('/', listWorks);
router.get('/:id', getWorkById);

router.put('/:id', requireRole('student'), updateWork);
router.delete('/:id', requireRole('student'), deleteWork);

export default router;
