import { z } from 'zod';
import { flagReasonSchema } from '../types/enums';

export const flagPriceSchema = z.object({
  submissionId: z.string().uuid(),
  reason: flagReasonSchema,
  comment: z
    .string()
    .trim()
    .max(140, 'Comment must be 140 characters or less')
    .optional()
    .or(z.literal('')),
});

export const flagPriceBodySchema = flagPriceSchema.omit({ submissionId: true });

export type FlagPriceInput = z.infer<typeof flagPriceSchema>;
export type FlagPriceBodyInput = z.infer<typeof flagPriceBodySchema>;
