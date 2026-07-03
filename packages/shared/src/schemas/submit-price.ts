import { z } from 'zod';
import { priceUnitSchema } from '../types/enums';
import { PRICE_LIMITS } from '../constants';

export const submitPriceSchema = z.object({
  marketId: z.string().uuid('Select a market'),
  productId: z.string().uuid('Select a product'),
  priceNaira: z
    .number()
    .int('Price must be a whole number')
    .min(PRICE_LIMITS.MIN_NAIRA, 'Price must be greater than zero')
    .max(PRICE_LIMITS.MAX_NAIRA, 'Price must be less than ₦1,000,000'),
  unit: priceUnitSchema,
  photoUrl: z.string().url().optional().or(z.literal('')),
  replacesSubmissionId: z.string().uuid().optional(),
  confirmOutlier: z.boolean().optional(),
});

export type SubmitPriceInput = z.infer<typeof submitPriceSchema>;
