import { z } from 'zod';
import { productCategorySchema } from '@lmi/shared';

export const productSearchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required'),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const trendingProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export type ProductSearchQuery = z.infer<typeof productSearchQuerySchema>;
export type TrendingProductsQuery = z.infer<typeof trendingProductsQuerySchema>;

export const listProductsQuerySchema = z.object({
  category: productCategorySchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
