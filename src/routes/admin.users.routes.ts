import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { setUserRoleCtrl } from '../controllers/admin.controller.js';

const router = Router();
router.post('/users/:uid/role', requireAuth, setUserRoleCtrl);
export default router;