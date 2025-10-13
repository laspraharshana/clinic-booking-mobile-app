import { z } from 'zod';

export const QuoteQuerySchema = z.object({
  slotId: z.string().min(1),
});

export const BookBodySchema = z.object({
  slotId: z.string().min(1),
  notes: z.string().max(2000).optional(),
  patientName: z.string().max(120).optional(),
});

export const CancelParamsSchema = z.object({
  id: z.string().min(1),
});

export const MeQuerySchema = z.object({
  scope: z.enum(['all', 'upcoming', 'completed', 'canceled']).optional(),
});