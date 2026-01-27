import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createPlagiarismReport,
  getPlagiarismReportByWorkId,
} from '../controllers/plagiarismReport.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('teacher'), createPlagiarismReport);
router.get('/by-work/:workId', getPlagiarismReportByWorkId);

export default router;
