//src/services/admin.service.ts
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
 * Get recent appointments (default limit = 5)
 */

export async function getRecentAppointments(limit = 5) {
  const snapshot = await db
    .collection('appointments')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  // Parallel fetching of doctor details
  const appointments = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();

      let doctorName = 'Unknown';
      let specialty = '';
      let clinicName = '';

      // ✅ If doctorId exists, fetch doctor info
      if (data.doctorId) {
        const doctorSnap = await db.collection('doctors').doc(data.doctorId).get();
        if (doctorSnap.exists) {
          const docData = doctorSnap.data();
          doctorName = docData?.name || 'Unknown';
          specialty = docData?.specialty || '';
          clinicName = docData?.clinicName || '';
        }
      }

      // Format readable time (if stored as UTC timestamp)
      const time = data.startUtc
        ? new Date(data.startUtc).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-';

      const date = data.startUtc ? new Date(data.startUtc).toLocaleDateString('en-US') : '-';

      return {
        id: doc.id,
        patientName: data.patientName || 'Unknown',
        doctorName,
        specialty,
        clinicName,
        date,
        time,
        status: data.status || 'pending',
        fee: data.fee?.total || 0,
      };
    }),
  );

  return appointments;
}
