import { z } from 'zod';

export const adminClaimActionSchema = z
  .object({
    action: z.enum(['approve', 'reject']),
    rejectionReason: z.string().trim().min(5).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.action === 'reject' && !data.rejectionReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'rejectionReason is required when action is reject',
        path: ['rejectionReason'],
      });
    }
  });

export type AdminClaimActionInput = z.infer<typeof adminClaimActionSchema>;
