import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDashboardCtrl } from '../controllers/admin.controller.js';

const router = Router();
router.get('/dashboard', requireAuth, getDashboardCtrl);

export default router;
