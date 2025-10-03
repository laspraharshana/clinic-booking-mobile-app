import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMe, patchMe } from '../controllers/me.controller.js';
const router = Router();
router.get('/', requireAuth, getMe);
router.patch('/', requireAuth, patchMe);
export default router;
