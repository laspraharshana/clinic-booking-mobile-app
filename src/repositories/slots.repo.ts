import { db } from '../lib/firebase.js';
import type { Slot } from '../models/types.js';

export const slotsRepo = {

  ref: (id: string) => db.collection('slots').doc(id),

  async getById(id: string): Promise<Slot | null> {
    const d = await this.ref(id).get();
    return d.exists ? ({ id: d.id, ...(d.data() as Omit<Slot, 'id'>) }) : null;
  },

  async listAvailableByDoctor(doctorId: string, from: number, to: number): Promise<Slot[]> {
    const q = await db
      .collection('slots')
      .where('doctorId', '==', doctorId)
      .where('status', '==', 'available')
      .where('startUtc', '>=', from)
      .where('startUtc', '<=', to)
      .orderBy('startUtc', 'asc')
      .get();

    return q.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Slot, 'id'>) }));
  },

  async nextAvailable(doctorId: string, from = Date.now()): Promise<Slot | null> {
    const q = await db
      .collection('slots')
      .where('doctorId', '==', doctorId)
      .where('status', '==', 'available')
      .where('startUtc', '>=', from)
      .orderBy('startUtc', 'asc')
      .limit(1)
      .get();

    if (q.empty) return null;
    const d = q.docs[0];
    return { id: d.id, ...(d.data() as Omit<Slot, 'id'>) };
  },
};
