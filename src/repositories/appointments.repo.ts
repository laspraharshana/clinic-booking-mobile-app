import { db } from '../lib/firebase.js';
import type { Appointment } from '../models/types.js';

const col = db.collection('appointments');

export const appointmentsRepo = {
  ref: (id: string) => col.doc(id),

  async getById(id: string): Promise<Appointment | null> {
    const d = await this.ref(id).get();
    return d.exists ? { id: d.id, ...(d.data() as Omit<Appointment, 'id'>) } : null;
  },

  async listByPatient(patientId: string): Promise<Appointment[]> {
    const q = await col.where('patientId', '==', patientId).orderBy('startUtc', 'asc').get();
    return q.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Appointment, 'id'>) }));
  },
};
