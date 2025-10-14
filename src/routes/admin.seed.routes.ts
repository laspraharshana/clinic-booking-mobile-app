import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../lib/firebase.js';
import { doctorsRepo } from '../repositories/doctors.repo.js';
import { slotsRepo } from '../repositories/slots.repo.js';
import { book } from '../services/appointments.service.js';
import multer from 'multer';
import { getStorage } from 'firebase-admin/storage';

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

interface Appointment {
  id: string;
  slotId: string;
  patientId: string;
  patientName?: string;
  notes?: string;
}

// Very simple dev protection
function checkAdminSecret(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.DEV_ADMIN_SECRET;
  if (!secret) return res.status(500).json({ error: 'DEV_ADMIN_SECRET not set' });
  if (req.header('x-admin-secret') !== secret)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
}

const router = Router();
router.use(checkAdminSecret);

// Multer in-memory storage for uploads (5MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /v1/admin/seed/doctors/bulk
router.post(
  '/doctors/bulk',
  async (
    req: Request<Record<string, string>, unknown, { items: DoctorSeedData[] }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const batch = db.batch();
      for (const d of items) {
        if (!d.id) continue;
        const ref = db.collection('doctors').doc(d.id);
        batch.set(
          ref,
          {
            name: d.name,
            specialty: d.specialty,
            clinicName: d.clinicName ?? null,
            address: d.address ?? null,
            bio: d.bio ?? null,
            yearsExp: d.yearsExp ?? null,
            patientsCount: d.patientsCount ?? null,
            rating: d.rating ?? null,
            consultationFee: d.consultationFee ?? null,
            photoUrl: d.photoUrl ?? null, // You can also set external URLs here
            updatedAt: Date.now(),
          },
          { merge: true },
        );
      }
      await batch.commit();
      res.json({ ok: true, count: items.length });
    } catch (e) {
      next(e);
    }
  },
);

// NEW: POST /v1/admin/seed/doctors/:id/photo (multipart upload)
router.post(
  '/doctors/:id/photo',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.params.id;
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) return res.status(400).json({ error: 'file is required (multipart/form-data)' });

      const bucket = getStorage().bucket(); // uses default bucket (set storageBucket in initializeApp)
      const path = `doctors/${doctorId}/profile.jpg`;
      const gcsFile = bucket.file(path);

      await gcsFile.save(file.buffer, {
        contentType: file.mimetype,
        metadata: { cacheControl: 'public, max-age=3600' },
        resumable: false,
      });

      // Try to make public; if uniform bucket-level access is on, fallback to signed URL
      let url: string;
      try {
        await gcsFile.makePublic();
        url = `https://storage.googleapis.com/${bucket.name}/${path}`;
      } catch {
        const [signed] = await gcsFile.getSignedUrl({ action: 'read', expires: '2500-01-01' });
        url = signed;
      }

      // Update doctor doc with photoUrl
      await db
        .collection('doctors')
        .doc(doctorId)
        .set({ photoUrl: url, updatedAt: Date.now() }, { merge: true });
      const snap = await db.collection('doctors').doc(doctorId).get();

      res.status(201).json({ data: { id: snap.id, ...(snap.data() as Record<string, unknown>) } });
    } catch (e) {
      next(e);
    }
  },
);

// POST /v1/admin/seed/slots/bulk
router.post(
  '/slots/bulk',
  async (
    req: Request<Record<string, string>, unknown, { items: SlotSeedData[] }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const batch = db.batch();
      for (const s of items) {
        if (!s.id || !s.doctorId) continue;
        const startUtc = typeof s.startUtc === 'number' ? s.startUtc : Date.parse(s.startIso || '');
        const endUtc = typeof s.endUtc === 'number' ? s.endUtc : Date.parse(s.endIso || '');
        if (!Number.isFinite(startUtc) || !Number.isFinite(endUtc)) continue;

        const ref = db.collection('slots').doc(s.id);
        batch.set(
          ref,
          {
            doctorId: s.doctorId,
            startUtc,
            endUtc,
            status: s.status ?? 'available',
            bookedBy: s.bookedBy ?? null,
          },
          { merge: true },
        );
      }
      await batch.commit();
      res.json({ ok: true, count: items.length });
    } catch (e) {
      next(e);
    }
  },
);

// POST /v1/admin/seed/appointments/bulk
router.post(
  '/appointments/bulk',
  async (
    req: Request<Record<string, string>, unknown, { items: AppointmentSeedData[] }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      const results: Appointment[] = [];
      for (const a of items) {
        if (!a.slotId || !a.patientId) continue;
        const appt: Appointment = await book(a.slotId, a.patientId, {
          patientName: a.patientName,
          notes: a.notes,
        });
        results.push(appt);
      }
      res.json({ ok: true, count: results.length, data: results });
    } catch (e) {
      next(e);
    }
  },
);

// DELETE slots (dev only)
router.post('/slots/delete', async (req, res, next) => {
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
      return res
        .status(400)
        .json({ error: 'Provide one of: { all:true } or { doctorId } or { ids:[...] }' });
    }

    let deleted = 0;
    while (toDelete.length) {
      const chunk = toDelete.splice(0, 400);
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
