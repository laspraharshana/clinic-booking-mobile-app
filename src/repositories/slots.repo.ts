import { db } from '../lib/firebase.js';
import type { Slot } from '../models/types.js';

export const slotsRepo = {
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
};