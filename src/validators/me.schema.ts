import { z } from 'zod';

export const patchMeSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  phone: z.string().min(6).max(20).optional(),
  photoUrl: z.string().url().optional(),
  notifications: z
    .object({
      push: z.boolean().optional(),
      reminders: z.boolean().optional(),
      sound: z.boolean().optional(),
      email: z.boolean().optional(),
    })
    .optional(),
  privacy: z
    .object({
      biometric: z.boolean().optional(),
      twoFactor: z.boolean().optional(),
    })
    .optional(),
  app: z
    .object({
      darkMode: z.boolean().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

export const createPaymentMethodSchema = z.object({
  brand: z.string().min(2),
  last4: z.string().regex(/^\d{4}$/),
});

export const paymentMethodIdSchema = z.object({
  id: z.string().min(1),
});