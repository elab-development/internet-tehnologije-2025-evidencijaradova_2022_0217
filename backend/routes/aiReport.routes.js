import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createAIReport,
  getAIReportByWorkId,
} from '../controllers/aiReport.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('teacher'), createAIReport);
router.get('/by-work/:workId', getAIReportByWorkId);

export default router;
