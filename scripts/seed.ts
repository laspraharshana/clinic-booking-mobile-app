import 'dotenv/config';
import { db } from '../src/lib/firebase.js';

async function seed() {
  // Seed doctors
  const doctors = [
    { id: 'dr_smith', name: 'Dr. Smith', specialty: 'General', clinicName: 'City Clinic' },
    { id: 'dr_lee', name: 'Dr. Lee', specialty: 'Dermatology', clinicName: 'SkinCare Clinic' },
  ];
  for (const d of doctors) {
    await db.collection('doctors').doc(d.id).set(d, { merge: true });
  }

  // Seed slots: next 3 days, 9:00, 10:00, 11:00, 12:00 (45-min each)
  const now = new Date();
  now.setMinutes(0, 0, 0);

  for (const d of doctors) {
    for (let day = 0; day < 3; day++) {
      for (const hour of [9, 10, 11, 12]) {
        const start = new Date(now);
        start.setDate(now.getDate() + day);
        start.setHours(hour);
        const end = new Date(start.getTime() + 45 * 60 * 1000);

        const slotId = `${d.id}_${start.getTime()}`;
        await db.collection('slots').doc(slotId).set({
          doctorId: d.id,
          startUtc: start.getTime(),
          endUtc: end.getTime(),
          status: 'available',
        });
      }
    }
  }
  console.log('Seeded doctors and slots');
}

seed().then(() => process.exit(0));
