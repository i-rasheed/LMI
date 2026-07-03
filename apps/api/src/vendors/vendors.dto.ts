import { stallClaimSchema, updateVendorProductSchema, vendorProductSchema } from '@lmi/shared';
import { z } from 'zod';

export { stallClaimSchema, vendorProductSchema, updateVendorProductSchema };

export const vendorAnalyticsEventSchema = z.object({
  vendorStallId: z.string().uuid(),
  eventType: z.enum(['profile_view', 'product_click']),
  productId: z.string().uuid().optional(),
});

export type StallClaimInput = z.infer<typeof stallClaimSchema>;
export type VendorProductInput = z.infer<typeof vendorProductSchema>;
export type UpdateVendorProductInput = z.infer<typeof updateVendorProductSchema>;
export type VendorAnalyticsEventInput = z.infer<typeof vendorAnalyticsEventSchema>;
