import { z } from 'zod';

export const addListItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export type AddListItemInput = z.infer<typeof addListItemSchema>;
