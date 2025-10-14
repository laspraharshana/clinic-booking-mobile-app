import type { Response, NextFunction } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { listPaymentMethods, addPaymentMethod, deletePaymentMethod } from '../services/me.service.js';
import { createPaymentMethodSchema, paymentMethodIdSchema } from '../validators/me.schema.js';

export async function getMyPaymentMethods(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = await listPaymentMethods(req.user!.uid);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function postMyPaymentMethod(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { brand, last4 } = createPaymentMethodSchema.parse(req.body);
    const data = await addPaymentMethod(req.user!.uid, brand, last4);
    res.status(201).json({ data });
  } catch (e) { next(e); }
}

export async function deleteMyPaymentMethod(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = paymentMethodIdSchema.parse(req.params);
    const data = await deletePaymentMethod(req.user!.uid, id);
    res.json({ data });
  } catch (e) { next(e); }
}