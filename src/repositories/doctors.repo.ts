import { db } from '../lib/firebase.js';
import type { Doctor } from '../models/types.js';

const col = db.collection('doctors');

export const doctorsRepo = {
  async listAll(): Promise<Doctor[]> {
    const snap = await db.collection('doctors').get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Doctor, 'id'>) }));
  },

  async getById(id: string): Promise<Doctor | null> {
    const doc = await col.doc(id).get();
    return doc.exists ? { id: doc.id, ...(doc.data() as Omit<Doctor, 'id'>) } : null;
  },

  async update(id: string, data: Partial<Doctor>): Promise<Doctor> {
    await col.doc(id).set(data, { merge: true });
    const doc = await col.doc(id).get();
    return { id: doc.id, ...(doc.data() as Omit<Doctor, 'id'>) };
  },
};
