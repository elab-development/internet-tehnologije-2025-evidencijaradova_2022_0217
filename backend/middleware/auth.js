import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient.js';

const COOKIE_NAME = process.env.COOKIE_NAME || 'truewrite_cookie';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export function setAuthCookie(res, token) {
  const isSecure = String(process.env.COOKIE_SECURE).toLowerCase() === 'true';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dana
    path: '/',
  });
}

export function clearAuthCookie(res) {
  const isSecure = String(process.env.COOKIE_SECURE).toLowerCase() === 'true';

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    path: '/',
  });
}

// 1) Provera da li je ulogovan
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.status(401).json({ message: 'Not authenticated' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
}

// 2) Provera role
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}