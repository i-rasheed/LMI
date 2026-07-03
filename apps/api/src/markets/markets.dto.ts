import { z } from 'zod';

export const listMarketsQuerySchema = z.object({
  area: z.string().trim().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius_km: z.coerce.number().min(0.1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const nearbyMarketsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius_km: z.coerce.number().min(0.1).max(500).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type ListMarketsQuery = z.infer<typeof listMarketsQuerySchema>;
export type NearbyMarketsQueryDto = z.infer<typeof nearbyMarketsQuerySchema>;
