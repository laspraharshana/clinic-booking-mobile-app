import { doctorsRepo } from '../repositories/doctors.repo.js';
import { slotsRepo } from '../repositories/slots.repo.js';

export async function listDoctors() {
  return doctorsRepo.listAll();
}

export async function listDoctorSlots(doctorId: string, from?: number, to?: number) {
  const start = from ?? Date.now();
  const end = to ?? start + 7 * 24 * 60 * 60 * 1000; // default 1 week
  return slotsRepo.listAvailableByDoctor(doctorId, start, end);
}

export async function getDoctorProfile(doctorId: string) {
  const doc = await doctorsRepo.getById(doctorId);
  if (!doc) {
    const err = new Error('Doctor not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  const next = await slotsRepo.nextAvailable(doctorId);
  return {
    ...doc,
    nextAvailableStartUtc: next?.startUtc ?? null,
  };
}
