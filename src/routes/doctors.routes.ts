import { Router } from 'express';
import { listDoctors, listDoctorSlots, getDoctor } from '../controllers/doctors.controller.js';

const router = Router();
router.get('/', listDoctors);
router.get('/:id/slots', listDoctorSlots);
router.get('/:id', getDoctor); // NEW: profile + nextAvailable

export default router;
