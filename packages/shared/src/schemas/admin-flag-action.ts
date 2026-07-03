import { z } from 'zod';
import { PRICE_LIMITS } from '../constants';

export const adminFlagActionSchema = z
  .object({
    action: z.enum(['confirm', 'edit', 'remove', 'warn', 'ban']),
    priceNaira: z
      .number()
      .int()
      .min(PRICE_LIMITS.MIN_NAIRA)
      .max(PRICE_LIMITS.MAX_NAIRA)
      .optional(),
    title: z.string().trim().min(1).max(100).optional(),
    body: z.string().trim().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.action === 'edit' && data.priceNaira == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'priceNaira is required when action is edit',
        path: ['priceNaira'],
      });
    }
  });

export type AdminFlagActionInput = z.infer<typeof adminFlagActionSchema>;
