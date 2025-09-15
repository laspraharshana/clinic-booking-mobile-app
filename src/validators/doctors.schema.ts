import { z } from 'zod';

export const listSlotsParamsSchema = z.object({
  id: z.string().min(1),
  from: z.coerce.number().optional(),
  to: z.coerce.number().optional(),
});
