import type { Response, NextFunction } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { getOrCreateProfile, updateMyProfile } from '../services/me.service.js';
import { patchMeSchema } from '../validators/me.schema.js';
export async function getMe(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await getOrCreateProfile(req.user!.uid);
    res.json({ data: profile });
  } catch (e) {
    next(e);
  }
}

export async function patchMe(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = patchMeSchema.parse(req.body);
    const profile = await updateMyProfile(req.user!.uid, body);
    res.json({ data: profile });
  } catch (e) {
    next(e);
  }
}
