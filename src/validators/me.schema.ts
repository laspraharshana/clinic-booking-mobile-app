import { z } from 'zod';
export const patchMeSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  phone: z.string().min(6).max(20).optional(),
  photoUrl: z.string().url().optional(),
});
