//src/controllers/admin.controller.ts
import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import { setRoleSchema } from '../validators/admin.schema.js';
import {
  setUserRole,
  getAllDoctors,
  getAllPatients,
  getRecentAppointments,
} from '../services/admin.service.js';

/**
 * ------------------------------
 * 1️⃣ Controller: Set User Role
 * ------------------------------
 * Updates the role of a user (patient/doctor/admin)
 */
export async function setUserRoleCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    // Validate UID from params
    const uid = z.string().min(1).parse(req.params.uid);
    const { role } = setRoleSchema.parse(req.body);

    // Check if current user is admin
    const meRole = req.user?.role;
    if (meRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // Update user role in Firebase
    const updated = await setUserRole(uid, role);

    res.json({
      message: 'User role updated successfully',
      updatedUser: updated,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * ------------------------------
 * 2️⃣ Controller: Get Dashboard Data
 * ------------------------------
 * Returns stats for admin dashboard:
 * - Total doctors
 * - Total patients
 * - Recent appointments (limit 10)
 * - Earnings
 */
export async function getDashboardCtrl(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const doctors = await getAllDoctors();
    const patients = await getAllPatients();
    const recentAppointments = await getRecentAppointments(5);

    // ✅ FIX: handle fee object correctly
    const earnings = recentAppointments.reduce((sum, appt) => {
      if (typeof appt.fee === 'number') return sum + appt.fee;
      if (typeof appt.fee === 'object' && appt.fee.total) return sum + appt.fee.total;
      return sum;
    }, 0);

    res.json({
      totalDoctors: doctors.length,
      totalPatients: patients.length,
      recentAppointments,
      earnings,
      earningsCurrency: 'LKR',
    });
  } catch (e) {
    next(e);
  }
}
/**
 * ------------------------------
 * 3️⃣ Controller: Get All Appointments
 * ------------------------------
 * Returns every appointment for the admin page
 */
import { db } from '../lib/firebase.js';

export async function getAllAppointmentsCtrl(_req: any, res: Response, next: any) {
  try {
    // Get all appointments (most recent first)
    const snapshot = await db.collection('appointments').orderBy('createdAt', 'desc').get();

    // Map and fetch doctor info
    const allAppointments = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();

        // -------------------------------
        // Get doctor info (name, specialty, clinic)
        // -------------------------------
        let doctorName = 'Unknown';
        let specialty = '';
        let clinicName = '';

        if (data.doctorId) {
          const doctorSnap = await db.collection('doctors').doc(data.doctorId).get();
          if (doctorSnap.exists) {
            const docData = doctorSnap.data();
            doctorName = docData?.name || 'Unknown';
            specialty = docData?.specialty || '';
            clinicName = docData?.clinicName || '';
          }
        }

        // -------------------------------
        // Convert timestamps (numbers) to ISO strings
        // -------------------------------
        const startUtcMs =
          typeof data.startUtc === 'number'
            ? data.startUtc > 1e12
              ? data.startUtc
              : data.startUtc * 1000
            : null;
        const endUtcMs =
          typeof data.endUtc === 'number'
            ? data.endUtc > 1e12
              ? data.endUtc
              : data.endUtc * 1000
            : null;
        const createdAtMs =
          typeof data.createdAt === 'number'
            ? data.createdAt > 1e12
              ? data.createdAt
              : data.createdAt * 1000
            : null;

        return {
          id: doc.id,
          patientName: data.patientName || 'Unknown',
          doctorId: data.doctorId || '',
          doctorName,
          specialty,
          clinicName,
          startUtc: startUtcMs ? new Date(startUtcMs).toISOString() : null,
          endUtc: endUtcMs ? new Date(endUtcMs).toISOString() : null,
          createdAt: createdAtMs ? new Date(createdAtMs).toISOString() : null,
          status: data.status || 'pending',
          mode: data.mode || 'online',
          fee: data.fee?.total || 0,
          notes: data.notes || '',
        };
      }),
    );

    res.status(200).json(allAppointments);
  } catch (e) {
    next(e);
  }
}
