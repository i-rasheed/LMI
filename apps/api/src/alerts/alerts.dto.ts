import { alertSchema } from '@lmi/shared';
import { z } from 'zod';

export { alertSchema };

export const updateAlertSchema = z.object({
  thresholdPercentage: z.union([z.literal(0), z.literal(10), z.literal(15), z.literal(20)]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
