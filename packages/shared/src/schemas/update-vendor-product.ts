import { z } from 'zod';
import { vendorProductBaseSchema } from './vendor-product';

export const updateVendorProductSchema = vendorProductBaseSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    'Provide at least one field to update',
  );

export type UpdateVendorProductInput = z.infer<typeof updateVendorProductSchema>;
