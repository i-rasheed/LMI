import { z } from 'zod';
import { productCategorySchema } from '../constants/product-categories';
import { priceUnitSchema } from '../types/enums';
import { PRICE_LIMITS } from '../constants';

export const vendorProductBaseSchema = z.object({
  productId: z.string().uuid().optional(),
  productName: z
    .string()
    .trim()
    .min(2, 'Enter a product name')
    .max(80, 'Product name is too long')
    .optional(),
  category: productCategorySchema.optional(),
  priceNaira: z
    .number()
    .int('Price must be a whole number')
    .min(PRICE_LIMITS.MIN_NAIRA, 'Price must be greater than zero')
    .max(PRICE_LIMITS.MAX_NAIRA, 'Price must be less than ₦1,000,000'),
  unit: priceUnitSchema,
  isAvailableToday: z.boolean(),
  photoUrl: z.string().url().optional().or(z.literal('')),
});

export const vendorProductSchema = vendorProductBaseSchema.superRefine(
  (data, ctx) => {
    const hasCatalogueProduct = Boolean(data.productId);
    const hasManualName = Boolean(data.productName?.trim());

    if (!hasCatalogueProduct && !hasManualName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a product name',
        path: ['productName'],
      });
    }
  },
);

export type VendorProductInput = z.infer<typeof vendorProductSchema>;
