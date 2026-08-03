import { NextRequest } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'fz.concern@gmail.com';

export function isAuthorizedAdmin(req: NextRequest): boolean {
  // Check cookie
  const cookieToken = req.cookies.get('admin_session')?.value;
  // Check header
  const headerToken = req.headers.get('x-admin-token') || req.headers.get('authorization')?.replace('Bearer ', '');

  const token = cookieToken || headerToken;
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.startsWith(ADMIN_EMAIL);
  } catch {
    return false;
  }
}
