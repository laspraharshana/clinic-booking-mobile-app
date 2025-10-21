//src/routes/admin.dashboard.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDashboardCtrl, getAllAppointmentsCtrl } from '../controllers/admin.controller.js';

const router = Router();
router.get('/dashboard', requireAuth, getDashboardCtrl);
router.get('/appointments', requireAuth, getAllAppointmentsCtrl);

export default router;
