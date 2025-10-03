import { usersRepo } from '../repositories/users.repo.js';
export async function getOrCreateProfile(uid: string) {
  const found = await usersRepo.get(uid);
  if (found) return found;
  return usersRepo.upsert(uid, { role: 'patient' });
}

export async function updateMyProfile(
  uid: string,
  data: Partial<{ name: string; phone: string; photoUrl: string }>,
) {
  return usersRepo.update(uid, data);
}
