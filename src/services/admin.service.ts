import { admin } from '../lib/firebase.js';
import { usersRepo } from '../repositories/users.repo.js';

export async function setUserRole(uid: string, role: 'patient' | 'doctor' | 'admin') {
await admin.auth().setCustomUserClaims(uid, { role });
const profile = await usersRepo.update(uid, { role });
return profile;
}