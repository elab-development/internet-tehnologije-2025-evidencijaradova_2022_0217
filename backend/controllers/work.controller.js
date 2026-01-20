import { uploadToCloudinaryBuffer } from '../lib/cloudinaryUpload.js';
import { prisma } from '../prismaClient.js';

/**
 * ============================================
 * CREATE WORK (WITH FILE UPLOAD TO CLOUDINARY)
 * ============================================
 * Naziv: Create Work
 * Metoda: POST (multipart/form-data)
 * Ruta: /api/works
 *
 * Opis:
 * Kreira novi rad i uploaduje priloženi fajl u Cloudinary.
 * U bazu upisuje fileUrl (secure_url).
 *
 * Telo zahteva:
 * - multipart/form-data
 * - title (string)
 * - subject (string)
 * - description (string, opcionalno)
 * - file (file) – polje naziva "file"
 *
 * Odgovor:
 * - 201 Created + { work }
 */
export async function createWork(req, res) {
  try {
    const { title, subject, description } = req.body;

    if (!title || !subject) {
      return res
        .status(400)
        .json({ message: 'title and subject are required' });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'file is required' });
    }

    const uploadRes = await uploadToCloudinaryBuffer(
      req.file.buffer,
      req.file.originalname,
    );

    const fileUrl = uploadRes.secure_url;

    const work = await prisma.work.create({
      data: {
        studentId: req.user.id,
        title,
        subject,
        description: description ?? null,
        fileUrl,
      },
    });

    return res.status(201).json({ work });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * LIST WORKS (FILTER + SEARCH + SORT)
 * ============================================
 * Naziv: List Works
 * Metoda: GET
 * Ruta: /api/works
 *
 * Opis:
 * Vraća listu radova uz mogućnost:
 * - sortiranja po submittedAt
 * - filtera po studentId (teacher/admin može bilo koji; student samo svog)
 * - pretrage po title, subject i description
 *
 * Pravila pristupa:
 * - teacher/admin: može da vidi sve radove
 * - student: vidi samo svoje radove (studentId = req.user.id)
 *
 * Query parametri:
 * - sort (string, opcionalno): "submittedAt:asc" | "submittedAt:desc" (default desc)
 * - studentId (string, opcionalno)
 * - q (string, opcionalno) – search tekst
 *
 * Odgovor:
 * - 200 OK + { works }
 */
export async function listWorks(req, res) {
  try {
    const { sort, studentId, q } = req.query;

    // default sort
    let orderBy = { submittedAt: 'desc' };
    if (typeof sort === 'string' && sort.startsWith('submittedAt:')) {
      const dir = sort.split(':')[1];
      if (dir === 'asc' || dir === 'desc') orderBy = { submittedAt: dir };
    }

    // base where
    const where = {};

    // STUDENT: force samo svoje
    if (req.user.role === 'student') {
      where.studentId = req.user.id;
    } else {
      // TEACHER/ADMIN: može filter studentId
      if (typeof studentId === 'string' && studentId.trim() !== '') {
        where.studentId = studentId.trim();
      }
    }

    // Search: title/subject/description
    if (typeof q === 'string' && q.trim() !== '') {
      const term = q.trim();
      where.OR = [
        { title: { contains: term } },
        { subject: { contains: term } },
        { description: { contains: term } },
      ];
    }

    const works = await prisma.work.findMany({
      where,
      orderBy,
      include: {
        student: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    return res.json({ works });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * GET WORK BY ID
 * ============================================
 * Naziv: Get Work
 * Metoda: GET
 * Ruta: /api/works/:id
 *
 * Opis:
 * Vraća jedan rad po ID-u.
 *
 * Pravila pristupa:
 * - teacher/admin: mogu da vide bilo koji rad
 * - student: može da vidi samo svoj rad
 *
 * Odgovor:
 * - 200 OK + { work }
 * - 404 Not Found ako rad ne postoji
 * - 403 Forbidden ako student pokušava tuđ rad
 */
export async function getWorkById(req, res) {
  try {
    const { id } = req.params;

    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    if (!work) return res.status(404).json({ message: 'Work not found' });

    if (req.user.role === 'student' && work.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json({ work });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * UPDATE WORK (ONLY PENDING)
 * ============================================
 * Naziv: Update Work
 * Metoda: PATCH
 * Ruta: /api/works/:id
 *
 * Opis:
 * Student može da izmeni svoj rad (title/subject/description/fileUrl),
 * ali samo dok je status "pending_review" (čeka ocenu).
 *
 * Telo zahteva (req.body):
 * - title (string, opcionalno)
 * - subject (string, opcionalno)
 * - description (string, opcionalno)
 * - fileUrl (string, opcionalno)
 *
 * Odgovor:
 * - 200 OK + { work }
 * - 403 Forbidden ako nije vlasnik ili nije pending
 */
export async function updateWork(req, res) {
  try {
    const { id } = req.params;
    const { title, subject, description, fileUrl } = req.body;

    const work = await prisma.work.findUnique({ where: { id } });
    if (!work) return res.status(404).json({ message: 'Work not found' });

    if (work.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (work.status !== 'pending_review') {
      return res
        .status(403)
        .json({ message: 'Cannot update work after review started' });
    }

    const data = {};
    if (typeof title === 'string') data.title = title;
    if (typeof subject === 'string') data.subject = subject;
    if (typeof description === 'string') data.description = description;
    if (typeof fileUrl === 'string') data.fileUrl = fileUrl;

    const updated = await prisma.work.update({
      where: { id },
      data,
    });

    return res.json({ work: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * DELETE WORK (ONLY PENDING)
 * ============================================
 * Naziv: Delete Work
 * Metoda: DELETE
 * Ruta: /api/works/:id
 *
 * Opis:
 * Student može da obriše svoj rad samo dok je status "pending_review".
 *
 * Odgovor:
 * - 200 OK + { ok: true }
 * - 403 Forbidden ako nije vlasnik ili nije pending
 */
export async function deleteWork(req, res) {
  try {
    const { id } = req.params;

    const work = await prisma.work.findUnique({ where: { id } });
    if (!work) return res.status(404).json({ message: 'Work not found' });

    if (work.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (work.status !== 'pending_review') {
      return res
        .status(403)
        .json({ message: 'Cannot delete work after review started' });
    }

    await prisma.work.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}