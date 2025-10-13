import { Router, RequestHandler } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getQuote, postBook, delCancel, getMe } from '../controllers/appointments.controller.js';

const router = Router();

// getQuote uses the standard Request type in the controller, so no cast is needed.
router.get('/quote', requireAuth, getQuote); 

// For postBook, delCancel, and getMe, we use 'as unknown as RequestHandler' 
// to bypass the strict type checking and assure the compiler that the
// requireAuth middleware handles the type compatibility at runtime.
router.post('/book', requireAuth, postBook as unknown as RequestHandler); 
router.delete('/cancel/:id', requireAuth, delCancel as unknown as RequestHandler); 
router.get('/me', requireAuth, getMe as unknown as RequestHandler); 

export default router;
