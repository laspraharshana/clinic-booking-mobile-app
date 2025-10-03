import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import { setRoleSchema } from '../validators/admin.schema.js';
import { setUserRole } from '../services/admin.service.js';

export async function setUserRoleCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
try {
const uid = z.string().min(1).parse(req.params.uid);
const { role } = setRoleSchema.parse(req.body);
const meRole = req.user?.role;
if (meRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
const updated = await setUserRole(uid, role);
res.json({ data: updated });
} catch (e) { next(e); }
}