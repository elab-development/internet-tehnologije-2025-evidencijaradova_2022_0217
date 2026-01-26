import { prisma } from '../prismaClient.js';

/**
 * ============================================
 * LIST USERS
 * ============================================
 * Naziv: List Users
 * Metoda: GET
 * Ruta: /api/users
 *
 * Opis:
 * Vraća listu svih korisnika u sistemu.
 * Dostupno isključivo administratoru.
 *
 * Query parametri (opciono, možeš i bez):
 * - q (string) – pretraga po fullName/email
 * - role (string) – student | teacher | admin
 *
 * Odgovor:
 * - 200 OK + { users }
 */
export async function listUsers(req, res) {
  try {
    const { q, role } = req.query;

    const where = {};

    if (
      typeof role === 'string' &&
      ['student', 'teacher', 'admin'].includes(role)
    ) {
      where.role = role;
    }

    if (typeof q === 'string' && q.trim() !== '') {
      const term = q.trim();
      where.OR = [
        { fullName: { contains: term } },
        { email: { contains: term } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * UPDATE USER ROLE
 * ============================================
 * Naziv: Update User Role
 * Metoda: PUT
 * Ruta: /api/users/:id/role
 *
 * Opis:
 * Administrator menja ulogu korisnika (student/teacher/admin).
 * Nije dozvoljeno menjati ulogu samom sebi
 *
 * Telo zahteva (req.body):
 * - role (string) – student | teacher | admin
 *
 * Odgovor:
 * - 200 OK + { user }
 * - 400 Bad Request ako je role nevalidan
 * - 404 Not Found ako user ne postoji
 */
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (id === req.user.id) {
      return res
        .status(403)
        .json({ message: 'You cannot change your own role' });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'User not found' });

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}
