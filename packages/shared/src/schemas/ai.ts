import { z } from 'zod';

export const aiSearchSchema = z.object({
  query: z.string().trim().min(2).max(120),
});

export const aiExplainOutlierSchema = z.object({
  productName: z.string().trim().min(1).max(120),
  marketName: z.string().trim().min(1).max(120),
  unit: z.string().trim().min(1).max(24),
  submittedPriceNaira: z.number().int().positive(),
  averagePriceNaira: z.number().int().positive().nullable().optional(),
});

export const aiModerateSchema = z.object({
  productName: z.string().trim().min(1).max(120),
  marketName: z.string().trim().min(1).max(120),
  submittedPriceNaira: z.number().int().positive(),
  averagePriceNaira: z.number().int().positive().nullable().optional(),
  flagReasons: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
  reporterBadgeLevel: z.string().trim().max(40).nullable().optional(),
});

export const aiDigestSchema = z.object({
  area: z.string().trim().min(1).max(120).optional(),
  productIds: z.array(z.string().uuid()).max(10).optional(),
});

export type AiSearchInput = z.infer<typeof aiSearchSchema>;
export type AiExplainOutlierInput = z.infer<typeof aiExplainOutlierSchema>;
export type AiModerateInput = z.infer<typeof aiModerateSchema>;
export type AiDigestInput = z.infer<typeof aiDigestSchema>;
