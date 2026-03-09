import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createPlagiarismReport,
  getPlagiarismReportByWorkId,
} from '../controllers/plagiarismReport.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/plagiarism-reports:
 *   post:
 *     tags: [PlagiarismReports]
 *     summary: Create plagiarism report (teacher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreatePlagiarismReportRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report: { $ref: '#/components/schemas/PlagiarismReport' }
 *       400:
 *         description: Bad Request (missing workId / not enough text / extraction failed)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Work not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Conflict (report already exists)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', requireRole('teacher'), createPlagiarismReport);

/**
 * @openapi
 * /api/plagiarism-reports/by-work/{workId}:
 *   get:
 *     tags: [PlagiarismReports]
 *     summary: Get plagiarism report by workId (student only own; teacher/admin any)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema: { type: string, example: "ckx...workCuid" }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   oneOf:
 *                     - { $ref: '#/components/schemas/PlagiarismReport' }
 *                     - { type: 'null' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Work not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/by-work/:workId', getPlagiarismReportByWorkId);

export default router;