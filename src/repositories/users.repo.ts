import { db } from '../lib/firebase.js';
const col = db.collection('users');

export type UserProfile = {
  id: string;
  name?: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'admin';
  photoUrl?: string | null;
  createdAt: number;
};

export const usersRepo = {
  async get(uid: string): Promise<UserProfile | null> {
    const doc = await col.doc(uid).get();
    return doc.exists ? { id: doc.id, ...(doc.data() as Omit<UserProfile, 'id'>) } : null;
  },

  async upsert(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const now = Date.now();
    await col.doc(uid).set({ createdAt: now, role: 'patient', ...data }, { merge: true });
    const doc = await col.doc(uid).get();
    return { id: doc.id, ...(doc.data() as Omit<UserProfile, 'id'>) };
  },

  async update(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await col.doc(uid).set(data, { merge: true });
    const doc = await col.doc(uid).get();
    return { id: doc.id, ...(doc.data() as Omit<UserProfile, 'id'>) };
  },
};
