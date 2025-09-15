import { Router } from 'express';
import { listDoctors, listDoctorSlots } from '../controllers/doctors.controller.js';

const router = Router();
router.get('/', listDoctors);
router.get('/:id/slots', listDoctorSlots);

export default router;
