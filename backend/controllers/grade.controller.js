import { prisma } from '../prismaClient.js';

/**
 * ============================================
 * CREATE GRADE
 * ============================================
 * Naziv: Create Grade
 * Metoda: POST
 * Ruta: /api/grades
 *
 * Opis:
 * Teacher ocenjuje neki Work. Maksimalno jedna ocena po radu (workId unique).
 * Teacher prosleđuje: workId, gradeValue i comment (opcionalno).
 * teacherId se uzima iz sesije (req.user.id).
 *
 * Telo zahteva (req.body):
 * - workId (string) – ID rada
 * - gradeValue (int) – npr 1-10
 * - comment (string, opcionalno)
 *
 * Odgovor:
 * - 201 Created + { grade }
 * - 409 Conflict ako rad već ima ocenu
 */
export async function createGrade(req, res) {
  try {
    const { workId, gradeValue, comment } = req.body;

    if (!workId || typeof gradeValue !== 'number') {
      return res
        .status(400)
        .json({ message: 'workId and gradeValue are required' });
    }

    if (!Number.isInteger(gradeValue) || gradeValue < 1 || gradeValue > 10) {
      return res
        .status(400)
        .json({ message: 'gradeValue must be an integer between 1 and 10' });
    }

    const work = await prisma.work.findUnique({ where: { id: workId } });
    if (!work) return res.status(404).json({ message: 'Work not found' });

    try {
      const grade = await prisma.grade.create({
        data: {
          workId,
          teacherId: req.user.id,
          gradeValue,
          comment: typeof comment === 'string' ? comment : null,
        },
        include: {
          work: {
            select: { id: true, title: true, subject: true, studentId: true },
          },
          teacher: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
      });

      return res.status(201).json({ grade });
    } catch (e) {
      // Prisma unique constraint error
      // MySQL: P2002 = Unique constraint failed
      if (e?.code === 'P2002') {
        return res
          .status(409)
          .json({ message: 'This work already has a grade' });
      }
      throw e;
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * GET GRADE BY WORK ID
 * ============================================
 * Naziv: Get Grade By Work
 * Metoda: GET
 * Ruta: /api/grades/by-work/:workId
 *
 * Opis:
 * Vraća ocenu za prosleđeni workId (maksimalno jednu).
 *
 * Pravila pristupa:
 * - student: može da vidi ocenu samo za svoj Work
 * - teacher/admin: mogu da vide ocenu za bilo koji Work
 *
 * Odgovor:
 * - 200 OK + { grade } (grade može biti null ako još nije ocenjen)
 * - 403 Forbidden ako student traži tuđ Work
 */
export async function getGradeByWorkId(req, res) {
  try {
    const { workId } = req.params;

    const work = await prisma.work.findUnique({
      where: { id: workId },
      select: { id: true, studentId: true },
    });

    if (!work) return res.status(404).json({ message: 'Work not found' });

    if (req.user.role === 'student' && work.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const grade = await prisma.grade.findUnique({
      where: { workId },
      include: {
        teacher: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        work: {
          select: { id: true, title: true, subject: true, studentId: true },
        },
      },
    });

    return res.json({ grade });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * UPDATE GRADE (ONLY OWNER TEACHER)
 * ============================================
 * Naziv: Update Grade
 * Metoda: PUT
 * Ruta: /api/grades/:id
 *
 * Opis:
 * Teacher može da ažurira samo svoju ocenu.
 * Dozvoljeno: gradeValue i comment.
 *
 * Telo zahteva (req.body):
 * - gradeValue (int, opcionalno)
 * - comment (string, opcionalno)
 *
 * Odgovor:
 * - 200 OK + { grade }
 * - 403 Forbidden ako teacher nije vlasnik ocene
 */
export async function updateGrade(req, res) {
  try {
    const { id } = req.params;
    const { gradeValue, comment } = req.body;

    const existing = await prisma.grade.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Grade not found' });

    if (existing.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const data = {};
    if (gradeValue !== undefined) {
      if (!Number.isInteger(gradeValue) || gradeValue < 1 || gradeValue > 10) {
        return res
          .status(400)
          .json({ message: 'gradeValue must be an integer between 1 and 10' });
      }
      data.gradeValue = gradeValue;
    }
    if (typeof comment === 'string') data.comment = comment;

    const grade = await prisma.grade.update({
      where: { id },
      data,
    });

    return res.json({ grade });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * DELETE GRADE (ONLY OWNER TEACHER)
 * ============================================
 * Naziv: Delete Grade
 * Metoda: DELETE
 * Ruta: /api/grades/:id
 *
 * Opis:
 * Teacher može da obriše samo svoju ocenu.
 *
 * Odgovor:
 * - 200 OK + { ok: true }
 * - 403 Forbidden ako teacher nije vlasnik ocene
 */
export async function deleteGrade(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.grade.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Grade not found' });

    if (existing.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.grade.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}
