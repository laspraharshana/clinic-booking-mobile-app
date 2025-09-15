import type { Request, Response, NextFunction } from 'express';
import { listDoctors as listDoctorsSvc, listDoctorSlots as listSlotsSvc } from '../services/doctors.service.js';
import { listSlotsParamsSchema } from '../validators/doctors.schema.js';

export async function listDoctors(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await listDoctorsSvc();
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

export async function listDoctorSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const params = listSlotsParamsSchema.parse({ id: req.params.id, ...req.query });
    const data = await listSlotsSvc(params.id, params.from, params.to);
    res.json({ data });
  } catch (e) {
    next(e);
  }
}