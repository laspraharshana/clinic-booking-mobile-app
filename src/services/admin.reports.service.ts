import { admin, db } from '../lib/firebase.js';
import { usersRepo } from '../repositories/users.repo.js';
import { doctorsRepo } from '../repositories/doctors.repo.js';
import { appointmentsRepo } from '../repositories/appointments.repo.js';

export async function getReportData(period: string) {
  const now = Date.now();
  let start: number;

  switch (period) {
    case 'Month':
      start = new Date().setMonth(new Date().getMonth() - 1);
      break;
    case 'Year':
      start = new Date().setFullYear(new Date().getFullYear() - 1);
      break;
    default:
      start = new Date().setDate(new Date().getDate() - 7);
  }

  const snap = await db
    .collection('appointments')
    .where('createdAt', '>=', start)
    .where('createdAt', '<=', now)
    .get();

  const data = snap.docs.map((doc) => doc.data());

  const totalAppointments = data.length;

  const totalRevenue = data.reduce((sum, a) => {
    if (a.fee && typeof a.fee.total === 'number') {
      return sum + a.fee.total;
    }
    return sum;
  }, 0);

  const newClients = new Set(data.map((a) => a.patientId)).size;

  const successCount = data.filter((a) =>
    ['completed', 'done', 'success', 'finished'].includes(a.status?.toLowerCase()),
  ).length;

  const successRate = totalAppointments > 0 ? (successCount / totalAppointments) * 100 : 0;

  return {
    totalRevenue,
    totalAppointments,
    newClients,
    successRate: Number(successRate.toFixed(1)),
  };
}
