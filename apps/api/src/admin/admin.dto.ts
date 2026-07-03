import { z } from 'zod';

export const flagQueueQuerySchema = z.object({
  market_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  min_flag_count: z.coerce.number().int().min(1).optional(),
});

export type FlagQueueQuery = z.infer<typeof flagQueueQuerySchema>;
