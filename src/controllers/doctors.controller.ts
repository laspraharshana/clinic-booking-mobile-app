import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  listDoctors as listDoctorsSvc,
  listDoctorSlots as listSlotsSvc,
  getDoctorProfile,
} from '../services/doctors.service.js';
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

export async function getDoctor(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const data = await getDoctorProfile(id);
    res.json({ data });
  } catch (e) {
    next(e);
  }
}
