import { Router } from 'express';
import { db } from '../lib/firebase.js';
import { z } from 'zod';

const router = Router();

// GET /v1/doctors
router.get('/', async (_req, res, next) => {
  try {
    const snap = await db.collection('doctors').get();
    const doctors = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ data: doctors });
  } catch (e) {
    next(e);
  }
});

// GET /v1/doctors/:id/slots?from=&to=
router.get('/:id/slots', async (req, res, next) => {
  try {
    const params = z
      .object({
        id: z.string(),
        from: z.coerce.number().optional(),
        to: z.coerce.number().optional(),
      })
      .parse({ id: req.params.id, ...req.query });

    const from = params.from ?? Date.now();
    const to = params.to ?? from + 7 * 24 * 60 * 60 * 1000; // 1 week

    // Query available slots by doctor within time range
    const q = await db
      .collection('slots')
      .where('doctorId', '==', params.id)
      .where('status', '==', 'available')
      .where('startUtc', '>=', from)
      .where('startUtc', '<=', to)
      .orderBy('startUtc', 'asc')
      .get();

    const slots = q.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ data: slots });
  } catch (e) {
    // If Firestore says "index required", open the link it prints to create the index.
    next(e);
  }
});

export default router;