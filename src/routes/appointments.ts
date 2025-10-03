import { Router } from 'express';
import { db } from '../lib/firebase.js';
import { z } from 'zod';

const router = Router();

// POST /v1/appointments/book → patient books appointment
router.post('/book', async (req, res, next) => {
  try {
    const data = z
      .object({
        doctorId: z.string(),
        patientId: z.string(),
        startUtc: z.number(),
        endUtc: z.number(),
      })
      .parse(req.body);

    const docRef = await db.collection('appointments').add({
      doctorId: data.doctorId,
      patientId: data.patientId,
      startUtc: data.startUtc,
      endUtc: data.endUtc,
      status: 'booked',
      createdAt: Date.now(),
    });

    res.json({ ok: true, id: docRef.id });
  } catch (e) {
    next(e);
  }
});

// DELETE /v1/appointments/cancel/:id → cancel appointment
router.delete('/cancel/:id', async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);

    const docRef = db.collection('appointments').doc(id);
    await docRef.update({ status: 'canceled', canceledAt: Date.now() });

    res.json({ ok: true, id });
  } catch (e) {
    next(e);
  }
});

// GET /v1/appointments/list?doctorId= → get doctor appointments
router.get('/list', async (req, res, next) => {
  try {
    const doctorId = z.string().parse(req.query.doctorId);

    const snap = await db.collection('appointments').where('doctorId', '==', doctorId).get();

    const appointments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ data: appointments });
  } catch (e) {
    next(e);
  }
}); // PUT /v1/appointments/:id → update (reschedule) appointment
router.put('/:id', async (req, res, next) => {
  try {
    const id = z.string().parse(req.params.id);

    const data = z
      .object({
        startUtc: z.number(),
        endUtc: z.number(),
      })
      .parse(req.body);

    const docRef = db.collection('appointments').doc(id);
    await docRef.update({ ...data, updatedAt: Date.now() });

    res.json({ ok: true, id });
  } catch (e) {
    next(e);
  }
});

export default router;
