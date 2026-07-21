import { z } from 'zod';

export const marketAverageQuerySchema = z.object({
  productId: z.string().uuid(),
  marketId: z.string().uuid(),
  unit: z.enum(['kg', 'piece', 'bunch', 'litre', 'crate', 'bag']),
});

export const comparePricesQuerySchema = z.object({
  sort: z.enum(['cheapest', 'freshest', 'nearest']).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  area: z.string().trim().optional(),
  max_distance_km: z.coerce.number().min(0.1).max(500).optional(),
  updated_within_hours: z.coerce.number().int().min(1).max(168).optional(),
});

export type ComparePricesQuery = z.infer<typeof comparePricesQuerySchema>;
export type MarketAverageQuery = z.infer<typeof marketAverageQuerySchema>;
