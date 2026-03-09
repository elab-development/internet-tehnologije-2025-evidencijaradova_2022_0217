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

/**
 * @openapi
 * /api/works:
 *   post:
 *     tags: [Works]
 *     summary: Create work (student) with file upload
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, subject, file]
 *             properties:
 *               title: { type: string, example: "Seminarski rad" }
 *               subject: { type: string, example: "ITEH" }
 *               description: { type: string, nullable: true, example: "Opis..." }
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 work: { $ref: '#/components/schemas/Work' }
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Forbidden (not student)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', requireRole('student'), upload.single('file'), createWork);

/**
 * @openapi
 * /api/works:
 *   get:
 *     tags: [Works]
 *     summary: List works (student only own; teacher/admin all with filters)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: "submittedAt:desc" }
 *         description: submittedAt:asc | submittedAt:desc
 *       - in: query
 *         name: studentId
 *         schema: { type: string, example: "ckx...studentCuid" }
 *         description: Teacher/admin filter by studentId
 *       - in: query
 *         name: q
 *         schema: { type: string, example: "internet" }
 *         description: Search by title/subject/description
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 works:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Work' }
 */
router.get('/', listWorks);

/**
 * @openapi
 * /api/works/{id}:
 *   get:
 *     tags: [Works]
 *     summary: Get work by id (student only own; teacher/admin any)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 work: { $ref: '#/components/schemas/Work' }
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', getWorkById);

/**
 * @openapi
 * /api/works/{id}:
 *   put:
 *     tags: [Works]
 *     summary: Update work (student only, only while pending_review)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: "ckx...workCuid" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateWorkRequest' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 work: { $ref: '#/components/schemas/Work' }
 *       403:
 *         description: Forbidden (not owner or not pending)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', requireRole('student'), updateWork);

/**
 * @openapi
 * /api/works/{id}:
 *   delete:
 *     tags: [Works]
 *     summary: Delete work (student only, only while pending_review)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 ok: { type: boolean, example: true }
 *       403:
 *         description: Forbidden (not owner or not pending)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', requireRole('student'), deleteWork);

export default router;