import { z } from 'zod';

export const initializeSubscriptionSchema = z.object({
  planId: z.string().uuid('Select a plan'),
  callbackUrl: z.string().url().optional(),
});

export type InitializeSubscriptionInput = z.infer<
  typeof initializeSubscriptionSchema
>;
