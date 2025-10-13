import type { Request, Response, NextFunction } from 'express';
import { QuoteQuerySchema, BookBodySchema, CancelParamsSchema, MeQuerySchema } from '../validators/appointments.schema.js';
import { quote, book, cancel, listForMe } from '../services/appointments.service.js';

interface AuthUser {
  uid: string;
}

interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export async function getQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const { slotId } = QuoteQuerySchema.parse(req.query);
    const data = await quote(slotId);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function postBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const body = BookBodySchema.parse(req.body);
    const uid = req.user.uid; 
    const data = await book(body.slotId, uid, { notes: body.notes, patientName: body.patientName });
    res.status(201).json({ data });
  } catch (e) { next(e); }
}

export async function delCancel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = CancelParamsSchema.parse(req.params);
    const uid = req.user.uid;
    const data = await cancel(id, uid);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { scope } = MeQuerySchema.parse(req.query);
    const uid = req.user.uid;
    const data = await listForMe(uid, scope);
    res.json({ data });
  } catch (e) { next(e); }
}
