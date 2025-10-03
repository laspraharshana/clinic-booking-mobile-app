import { z } from 'zod';
export const setRoleSchema = z.object({ role: z.enum(['patient', 'doctor', 'admin']) });
