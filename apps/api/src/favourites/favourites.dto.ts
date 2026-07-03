import { z } from 'zod';

export const favouriteBodySchema = z.object({
  productId: z.string().uuid(),
});

export type FavouriteBody = z.infer<typeof favouriteBodySchema>;
