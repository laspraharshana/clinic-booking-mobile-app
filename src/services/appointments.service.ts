import { db } from '../lib/firebase.js';
import { HttpError } from '../lib/errors.js';
import { slotsRepo } from '../repositories/slots.repo.js';
import { doctorsRepo } from '../repositories/doctors.repo.js';
import { appointmentsRepo } from '../repositories/appointments.repo.js';
import type { Appointment, Fee } from '../models/types.js';

const PLATFORM_FEE_LKR = Number(process.env.PLATFORM_FEE_LKR ?? '5');

async function computeFee(doctorId: string): Promise<Fee> {
  const doctor = await doctorsRepo.getById(doctorId);
  const consultation = Number(doctor?.consultationFee ?? 0);
  const platform = PLATFORM_FEE_LKR;
  return {
    consultation,
    platform,
    total: consultation + platform,
    currency: 'LKR',
  };
}

export async function quote(slotId: string) {
  const slot = await slotsRepo.getById(slotId);
  if (!slot) throw new HttpError(404, 'Slot not found', { code: 'SLOT_NOT_FOUND' });
  if (slot.status !== 'available')
    throw new HttpError(409, 'Slot already booked', { code: 'SLOT_TAKEN' });
  if (slot.startUtc <= Date.now())
    throw new HttpError(400, 'Slot is in the past', { code: 'PAST_SLOT' });

  const fee = await computeFee(slot.doctorId);
  return {
    slotId: slot.id,
    doctorId: slot.doctorId,
    startUtc: slot.startUtc,
    endUtc: slot.endUtc,
    fee,
  };
}

export async function book(
  slotId: string,
  patientId: string,
  opts?: { notes?: string; patientName?: string },
): Promise<Appointment> {
  const now = Date.now();
  return await db.runTransaction(async (tx) => {
    const slotRef = slotsRepo.ref(slotId);
    const slotSnap = await tx.get(slotRef);
    if (!slotSnap.exists) throw new HttpError(404, 'Slot not found', { code: 'SLOT_NOT_FOUND' });

    const slot = slotSnap.data() as any;
    if (slot.status !== 'available')
      throw new HttpError(409, 'Slot already booked', { code: 'SLOT_TAKEN' });
    if (slot.startUtc <= now)
      throw new HttpError(400, 'Slot is in the past', { code: 'PAST_SLOT' });

    const fee = await computeFee(slot.doctorId);

    // Prepare appointment doc id = slotId
    const apptRef = appointmentsRepo.ref(slotId);

    const appointment: Omit<Appointment, 'id'> = {
      slotId,
      doctorId: slot.doctorId,
      patientId,
      patientName: opts?.patientName,
      startUtc: slot.startUtc,
      endUtc: slot.endUtc,
      status: 'booked',
      notes: opts?.notes,
      fee,
      createdAt: now,
    };

    // Atomically mark slot and create appointment
    tx.update(slotRef, { status: 'booked', bookedBy: patientId, updatedAt: now });
    tx.set(apptRef, appointment, { merge: false });

    return { id: slotId, ...appointment };
  });
}

export async function cancel(appointmentId: string, uid: string) {
  const now = Date.now();
  return await db.runTransaction(async (tx) => {
    const apptRef = appointmentsRepo.ref(appointmentId);
    const apptSnap = await tx.get(apptRef);
    if (!apptSnap.exists)
      throw new HttpError(404, 'Appointment not found', { code: 'APPT_NOT_FOUND' });

    const appt = apptSnap.data() as any;
    if (appt.patientId !== uid)
      throw new HttpError(403, 'Not your appointment', { code: 'FORBIDDEN' });
    if (appt.status !== 'booked')
      throw new HttpError(400, 'Appointment not active', { code: 'NOT_ACTIVE' });
    if (appt.startUtc <= now)
      throw new HttpError(400, 'Cannot cancel past/ongoing appointment', {
        code: 'PAST_OR_ONGOING',
      });

    const slotRef = slotsRepo.ref(appointmentId);
    const slotSnap = await tx.get(slotRef);
    if (!slotSnap.exists) throw new HttpError(404, 'Slot not found', { code: 'SLOT_NOT_FOUND' });
    const slot = slotSnap.data() as any;

    // Only release if it’s still booked by the same user
    if (slot.bookedBy !== uid)
      throw new HttpError(409, 'Slot not held by you', { code: 'CONFLICT' });

    tx.update(slotRef, { status: 'available', bookedBy: null, updatedAt: now });
    tx.update(apptRef, { status: 'canceled', canceledAt: now });

    return { ok: true };
  });
}

export async function listForMe(
  uid: string,
  scope?: 'all' | 'upcoming' | 'completed' | 'canceled',
) {
  const list = await appointmentsRepo.listByPatient(uid);
  const now = Date.now();
  return list.filter((a) => {
    switch (scope) {
      case 'upcoming':
        return a.status === 'booked' && a.startUtc >= now;
      case 'completed':
        return a.status === 'booked' && a.endUtc < now;
      case 'canceled':
        return a.status === 'canceled';
      default:
        return true;
    }
  });
}
