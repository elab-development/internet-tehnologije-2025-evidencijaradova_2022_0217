import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createAIReport,
  getAIReportByWorkId,
} from '../controllers/aiReport.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/ai-reports:
 *   post:
 *     tags: [AIReports]
 *     summary: Create AI report (teacher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateAIReportRequest' }
 *     responses:
 *       201:
 *         description: Created (may return warning if AI service unavailable)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report: { $ref: '#/components/schemas/AIReport' }
 *                 warning: { type: string, nullable: true, example: "AI service unavailable: ..." }
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
router.post('/', requireRole('teacher'), createAIReport);

/**
 * @openapi
 * /api/ai-reports/by-work/{workId}:
 *   get:
 *     tags: [AIReports]
 *     summary: Get AI report by workId (student only own; teacher/admin any)
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
 *                     - { $ref: '#/components/schemas/AIReport' }
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
router.get('/by-work/:workId', getAIReportByWorkId);

export default router;