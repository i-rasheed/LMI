import { z } from 'zod';

export const stallClaimSchema = z.object({
  marketId: z.string().uuid('Select a market'),
  stallName: z
    .string()
    .trim()
    .min(2, 'Stall name is required')
    .max(100, 'Stall name is too long'),
  categories: z
    .array(z.string().trim().min(1))
    .min(1, 'Select at least one category'),
  description: z
    .string()
    .trim()
    .min(10, 'Description is required')
    .max(300, 'Description must be 300 characters or less'),
  locationHint: z
    .string()
    .trim()
    .min(2, 'Stall location is required')
    .max(120, 'Location hint is too long'),
  photos: z.array(z.string().url()).max(5, 'Maximum 5 photos').optional(),
});

export type StallClaimInput = z.infer<typeof stallClaimSchema>;
