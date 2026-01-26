import bcrypt from 'bcrypt';
import { prisma } from '../prismaClient.js';
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from '../middleware/auth.js';

const SALT_ROUNDS = 10;

/**
 * ============================================
 * REGISTER USER
 * ============================================
 * Naziv: Register
 * Metoda: POST
 * Ruta: /api/auth/register
 *
 * Opis:
 * Kreira novog korisnika u sistemu. Lozinka se hešira pomoću bcrypt-a.
 * Po uspešnoj registraciji korisniku se automatski kreira JWT token
 * i postavlja se httpOnly cookie za autentifikaciju.
 *
 * Telo zahteva (req.body):
 * - fullName (string) – puno ime korisnika
 * - email (string) – email adresa (jedinstvena)
 * - password (string) – lozinka u čistom tekstu
 *
 * Odgovor:
 * - 201 Created + objekat korisnika (bez lozinke)
 */
export async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'fullName, email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: 'student',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = signToken({ userId: user.id, role: user.role });
    setAuthCookie(res, token);

    return res.status(201).json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * LOGIN USER
 * ============================================
 * Naziv: Login
 * Metoda: POST
 * Ruta: /api/auth/login
 *
 * Opis:
 * Prijavljuje korisnika na osnovu email-a i lozinke.
 * Ako su kredencijali validni, generiše se JWT token
 * i postavlja se u httpOnly cookie.
 *
 * Telo zahteva (req.body):
 * - email (string)
 * - password (string)
 *
 * Odgovor:
 * - 200 OK + objekat ulogovanog korisnika
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'email and password are required' });

    const userWithHash = await prisma.user.findUnique({ where: { email } });
    if (!userWithHash)
      return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, userWithHash.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const safeUser = {
      id: userWithHash.id,
      fullName: userWithHash.fullName,
      email: userWithHash.email,
      role: userWithHash.role,
      createdAt: userWithHash.createdAt,
      updatedAt: userWithHash.updatedAt,
    };

    const token = signToken({ userId: safeUser.id, role: safeUser.role });
    setAuthCookie(res, token);

    return res.json({ user: safeUser });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * ============================================
 * LOGOUT USER
 * ============================================
 * Naziv: Logout
 * Metoda: POST
 * Ruta: /api/auth/logout
 *
 * Opis:
 * Odjavljuje korisnika tako što briše autentifikacioni cookie.
 * Ne zahteva telo zahteva.
 *
 * Odgovor:
 * - 200 OK + { ok: true }
 */
export async function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ ok: true });
}

/**
 * ============================================
 * GET CURRENT SESSION (ME)
 * ============================================
 * Naziv: Me
 * Metoda: GET
 * Ruta: /api/auth/me
 *
 * Opis:
 * Vraća podatke trenutno ulogovanog korisnika na osnovu
 * JWT tokena iz cookie-a. Ruta je zaštićena middleware-om requireAuth.
 *
 * Odgovor:
 * - 200 OK + objekat korisnika
 */
export async function me(req, res) {
  return res.json({ user: req.user });
}
