import { z } from 'zod';
import { vendorProductSchema } from './vendor-product';

export const updateVendorProductSchema = vendorProductSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    'Provide at least one field to update',
  );

export type UpdateVendorProductInput = z.infer<typeof updateVendorProductSchema>;
