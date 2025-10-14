import { admin, db } from '../lib/firebase.js';
import { usersRepo } from '../repositories/users.repo.js';
import { doctorsRepo } from '../repositories/doctors.repo.js';
import { appointmentsRepo } from '../repositories/appointments.repo.js';

/**
 * Set user role (patient/doctor/admin)
 */
export async function setUserRole(uid: string, role: 'patient' | 'doctor' | 'admin') {
  await admin.auth().setCustomUserClaims(uid, { role });
  const profile = await usersRepo.update(uid, { role });
  return profile;
}

/**
 * Get all doctors
 */
export async function getAllDoctors() {
  const snapshot = await db.collection('doctors').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get all patients
 */
export async function getAllPatients() {
  const snapshot = await db.collection('users').where('role', '==', 'patient').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get recent appointments (default limit = 10)
 */
export async function getRecentAppointments(limit = 10) {
  const snapshot = await db
    .collection('appointments')
    .orderBy('createdAt', 'desc') // make sure you have a createdAt field
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      patientName: data.patientName,
      doctorName: data.doctorName,
      time: data.time,
      status: data.status,
      fee: data.fee || 0, // optional
    };
  });
}