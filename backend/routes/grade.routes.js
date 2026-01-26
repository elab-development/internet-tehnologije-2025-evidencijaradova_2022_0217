import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createGrade,
  getGradeByWorkId,
  updateGrade,
  deleteGrade,
} from '../controllers/grade.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('teacher'), createGrade);
router.get('/by-work/:workId', requireAuth, getGradeByWorkId);

router.put('/:id', requireRole('teacher'), updateGrade);
router.delete('/:id', requireRole('teacher'), deleteGrade);

export default router;
