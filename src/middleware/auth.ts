//src/middleware/auth.ts
import type { Request, Response, NextFunction } from 'express';
import { admin } from '../lib/firebase.js';
import type { DecodedIdToken } from 'firebase-admin/auth'; // <--- Add this import

// Define a type that includes your custom 'role' claim
interface CustomDecodedToken extends DecodedIdToken {
  role?: 'patient' | 'doctor' | 'admin'; // Custom claim added by you
}

export interface AuthedRequest extends Request {
  user?: { uid: string; email?: string; role?: 'patient' | 'doctor' | 'admin' };
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const h = req.header('authorization') || req.header('Authorization') || '';

    const token = h.startsWith('Bearer ') ? h.slice(7) : '';

    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

    const decoded = await admin.auth().verifyIdToken(token);

    // Assertion to the specific interface:
    const decodedWithRole = decoded as CustomDecodedToken;

    // Access the role property safely
    const role = decodedWithRole.role;

    req.user = { uid: decoded.uid, email: decoded.email, role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles: Array<'patient' | 'doctor' | 'admin'>) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const r = req.user?.role;
    if (!r || !roles.includes(r)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
