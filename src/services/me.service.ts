import { usersRepo } from '../repositories/users.repo.js';
import { db } from '../lib/firebase.js';
// Assuming UserProfile is the full type defined elsewhere.

// Shape accepted by PATCH /v1/me (align this with your patchMeSchema)
type PatchMeInput = Partial<{
  name: string;
  phone: string;
  photoUrl: string; // The full UserProfile type should likely define this as string | null | undefined
  notifications: {
    push?: boolean;
    reminders?: boolean;
    sound?: boolean;
    email?: boolean;
  };
  privacy: {
    biometric?: boolean;
    twoFactor?: boolean;
  };
  app: {
    darkMode?: boolean;
    language?: string;
  };
}>;

export async function getOrCreateProfile(uid: string) {
  const found = await usersRepo.get(uid);
  if (found) return found;

  const now = Date.now();
  // Defaults for a new patient profile
  const defaults = {
    role: 'patient' as const,
    name: '',
    phone: '',
    // 💡 CORRECTION: Changed 'null' to 'undefined' to satisfy the type
    // 'string | undefined' expected by Partial<UserProfile>.
    photoUrl: undefined as string | undefined, 
    notifications: {
      push: true,
      reminders: true,
      sound: true,
      email: false,
    },
    privacy: {
      biometric: false,
      twoFactor: false,
    },
    app: {
      darkMode: false,
      language: 'English',
    },
    createdAt: now,
    updatedAt: now,
  };

  await usersRepo.upsert(uid, defaults); // This line is now error-free
  return usersRepo.get(uid);
}

export async function updateMyProfile(uid: string, data: PatchMeInput) {
  // Merge, don’t overwrite: nested objects should deep-merge in Firestore with merge:true
  const patch = {
    ...data,
    updatedAt: Date.now(),
  };
  await usersRepo.update(uid, patch);
  return usersRepo.get(uid);
}

/* Optional: Payment methods (PCI-safe, brand + last4 only)
  Stored in subcollection: users/{uid}/paymentMethods
*/
export async function listPaymentMethods(uid: string) {
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('paymentMethods')
    .orderBy('createdAt', 'desc')
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
}

export async function addPaymentMethod(uid: string, brand: string, last4: string) {
  const col = db.collection('users').doc(uid).collection('paymentMethods');
  const doc = await col.add({ brand, last4, createdAt: Date.now() });
  const snap = await doc.get();
  return { id: snap.id, ...(snap.data() as Record<string, unknown>) };
}

export async function deletePaymentMethod(uid: string, id: string) {
  await db.collection('users').doc(uid).collection('paymentMethods').doc(id).delete();
  return { ok: true };
}