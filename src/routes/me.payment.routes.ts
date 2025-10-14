import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyPaymentMethods, postMyPaymentMethod, deleteMyPaymentMethod } from '../controllers/me.payment.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', getMyPaymentMethods);         // GET  /v1/me/payment-methods
router.post('/', postMyPaymentMethod);        // POST /v1/me/payment-methods
router.delete('/:id', deleteMyPaymentMethod); // DELETE /v1/me/payment-methods/:id

export default router;