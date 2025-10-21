import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getReportsCtrl } from '../controllers/admin.reports.controller.js';

const router = Router();

// Admin-only access
router.get('/', requireAuth, requireRole('admin'), getReportsCtrl);

export default router;
