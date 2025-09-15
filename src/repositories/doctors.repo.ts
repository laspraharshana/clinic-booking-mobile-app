import { db } from '../lib/firebase.js';
import type { Doctor } from '../models/types.js';

export const doctorsRepo = {
  async listAll(): Promise<Doctor[]> {
    const snap = await db.collection('doctors').get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Doctor, 'id'>) }));
  },
};
