import { Router, Request, Response, NextFunction } from 'express';
import { createAdminUser } from '../controllers/admin.users.controller.js';

const router = Router();

/**
 * Middleware to check for the 'x-admin-secret' header against the DEV_ADMIN_SECRET environment variable.
 */
function checkAdminSecret(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.DEV_ADMIN_SECRET;

  // Check if the secret is set in environment variables
  if (!secret) {
    return res.status(500).json({ error: 'DEV_ADMIN_SECRET not set' });
  }

  // Check if the provided header matches the secret
  if (req.header('x-admin-secret') !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Proceed to the next handler
  next();
}

router.post('/', checkAdminSecret, createAdminUser);

export default router;
