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

/**
 * @openapi
 * /api/grades:
 *   post:
 *     tags: [Grades]
 *     summary: Create grade for a work (teacher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateGradeRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 grade: { $ref: '#/components/schemas/Grade' }
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Work not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Conflict (work already has a grade)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', requireRole('teacher'), createGrade);

/**
 * @openapi
 * /api/grades/by-work/{workId}:
 *   get:
 *     tags: [Grades]
 *     summary: Get grade by workId (student only own; teacher/admin any)
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
 *                 grade:
 *                   oneOf:
 *                     - { $ref: '#/components/schemas/Grade' }
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
router.get('/by-work/:workId', requireAuth, getGradeByWorkId);

/**
 * @openapi
 * /api/grades/{id}:
 *   put:
 *     tags: [Grades]
 *     summary: Update grade (teacher only, only owner of grade)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: "ckx...gradeCuid" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateGradeRequest' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 grade: { $ref: '#/components/schemas/Grade' }
 *       400:
 *         description: Bad Request (invalid gradeValue)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Forbidden (not owner)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Grade not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', requireRole('teacher'), updateGrade);

/**
 * @openapi
 * /api/grades/{id}:
 *   delete:
 *     tags: [Grades]
 *     summary: Delete grade (teacher only, only owner of grade)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: "ckx...gradeCuid" }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       403:
 *         description: Forbidden (not owner)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Grade not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', requireRole('teacher'), deleteGrade);

export default router;