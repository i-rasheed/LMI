import { z } from 'zod';

export const alertThresholdSchema = z.union([
  z.literal(0),
  z.literal(10),
  z.literal(15),
  z.literal(20),
]);

export const alertSchema = z.object({
  productId: z.string().uuid('Select a product'),
  thresholdPercentage: alertThresholdSchema.default(15),
  isActive: z.boolean().default(true),
});

export type AlertInput = z.infer<typeof alertSchema>;
export type AlertThreshold = z.infer<typeof alertThresholdSchema>;
