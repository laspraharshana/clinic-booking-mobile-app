import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../lib/firebase.js';
import { doctorsRepo } from '../repositories/doctors.repo.js';
import { slotsRepo } from '../repositories/slots.repo.js';
import { book } from '../services/appointments.service.js';

// --- Define interfaces for expected data shapes ---

interface DoctorSeedData {
  id: string;
  name: string;
  specialty: string;
  clinicName?: string | null;
  address?: string | null;
  bio?: string | null;
  yearsExp?: number | null;
  patientsCount?: number | null;
  rating?: number | null;
  consultationFee?: number | null;
  photoUrl?: string | null;
}

interface SlotSeedData {
  id: string;
  doctorId: string;
  startUtc?: number;
  endUtc?: number;
  startIso?: string;
  endIso?: string;
  status?: 'available' | 'booked';
  bookedBy?: string | null;
}

interface AppointmentSeedData {
  slotId: string;
  patientId: string;
  patientName: string;
  notes?: string;
}

// NOTE: Adjust this interface to match the actual return type of your `book` service
// NOTE: Adjust this interface to match the actual return type of your `book` service
interface Appointment {
  id: string;
  slotId: string;
  patientId: string;
  patientName?: string; // <-- SOLUTION: The '?' makes it optional (string | undefined)
  notes?: string;
  // ... other properties returned by the book service
}

// Very simple dev protection
function checkAdminSecret(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.DEV_ADMIN_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'DEV_ADMIN_SECRET not set' });
  }
  if (req.header('x-admin-secret') !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

const router = Router();
router.use(checkAdminSecret);

// POST /v1/admin/seed/doctors/bulk
router.post(
  '/doctors/bulk',
  async (req: Request<Record<string, string>, unknown, { items: DoctorSeedData[] }>, res: Response, next: NextFunction) => {
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const batch = db.batch();
      for (const d of items) {
        if (!d.id) continue;
        const ref = db.collection('doctors').doc(d.id);
        batch.set(ref, {
          name: d.name,
          specialty: d.specialty,
          clinicName: d.clinicName ?? null,
          address: d.address ?? null,
          bio: d.bio ?? null,
          yearsExp: d.yearsExp ?? null,
          patientsCount: d.patientsCount ?? null,
          rating: d.rating ?? null,
          consultationFee: d.consultationFee ?? null,
          photoUrl: d.photoUrl ?? null,
        }, { merge: true });
      }
      await batch.commit();
      res.json({ ok: true, count: items.length });
    } catch (e) {
      next(e);
    }
  }
);

// POST /v1/admin/seed/slots/bulk
// Accepts either startUtc/endUtc (numbers) OR startIso/endIso (strings)
router.post(
  '/slots/bulk',
  async (req: Request<Record<string, string>, unknown, { items: SlotSeedData[] }>, res: Response, next: NextFunction) => {
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const batch = db.batch();
      for (const s of items) {
        if (!s.id || !s.doctorId) continue;
        const startUtc = typeof s.startUtc === 'number' ? s.startUtc : Date.parse(s.startIso || '');
        const endUtc = typeof s.endUtc === 'number' ? s.endUtc : Date.parse(s.endIso || '');
        if (!Number.isFinite(startUtc) || !Number.isFinite(endUtc)) continue;

        const ref = db.collection('slots').doc(s.id);
        batch.set(ref, {
          doctorId: s.doctorId,
          startUtc,
          endUtc,
          status: s.status ?? 'available',
          bookedBy: s.bookedBy ?? null,
        }, { merge: true });
      }
      await batch.commit();
      res.json({ ok: true, count: items.length });
    } catch (e) {
      next(e);
    }
  }
);

// POST /v1/admin/seed/appointments/bulk (dev only)
// Books via service so slot + appointment stay consistent
router.post(
  '/appointments/bulk',
  async (req: Request<Record<string, string>, unknown, { items: AppointmentSeedData[] }>, res: Response, next: NextFunction) => {
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const results: Appointment[] = [];
      for (const a of items) {
        if (!a.slotId || !a.patientId) continue;
        // Assuming `book` returns a promise that resolves to an `Appointment` object
        const appt: Appointment = await book(a.slotId, a.patientId, { patientName: a.patientName, notes: a.notes });
        results.push(appt);
      }
      res.json({ ok: true, count: results.length, data: results });
    } catch (e) {
      next(e);
    }
  }
);

// DELETE slots (dev only)
// Body can be:
// { "all": true } OR { "doctorId": "dr_sarah" } OR { "ids": ["slot_001","slot_002"] }
router.post('/slots/delete', checkAdminSecret, async (req, res, next) => {
  try {
    const { all, doctorId, ids } = req.body ?? {};
    let toDelete: FirebaseFirestore.DocumentReference[] = [];

    if (all === true) {
      const snap = await db.collection('slots').get();
      toDelete = snap.docs.map((d) => d.ref);
    } else if (doctorId) {
      const snap = await db.collection('slots').where('doctorId', '==', doctorId).get();
      toDelete = snap.docs.map((d) => d.ref);
    } else if (Array.isArray(ids) && ids.length > 0) {
      toDelete = ids.map((id: string) => db.collection('slots').doc(id));
    } else {
      return res.status(400).json({ error: 'Provide one of: { all:true } or { doctorId } or { ids:[...] }' });
    }

    let deleted = 0;
    while (toDelete.length) {
      const chunk = toDelete.splice(0, 400); // batch limit safe split
      const batch = db.batch();
      chunk.forEach((ref) => batch.delete(ref));
      await batch.commit();
      deleted += chunk.length;
    }

    res.json({ ok: true, deleted });
  } catch (e) {
    next(e);
  }
});

export default router;