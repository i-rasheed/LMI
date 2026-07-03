import { z } from 'zod';
import { priceUnitSchema } from '../types/enums';
import { PRICE_LIMITS } from '../constants';

export const vendorProductSchema = z.object({
  productId: z.string().uuid('Select a product'),
  priceNaira: z
    .number()
    .int('Price must be a whole number')
    .min(PRICE_LIMITS.MIN_NAIRA, 'Price must be greater than zero')
    .max(PRICE_LIMITS.MAX_NAIRA, 'Price must be less than ₦1,000,000'),
  unit: priceUnitSchema,
  isAvailableToday: z.boolean(),
  photoUrl: z.string().url().optional().or(z.literal('')),
});

export type VendorProductInput = z.infer<typeof vendorProductSchema>;
