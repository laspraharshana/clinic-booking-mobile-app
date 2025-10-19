// admin.controller.ts
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
