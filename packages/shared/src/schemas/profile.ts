import { z } from 'zod';
import { languagePreferenceSchema, themePreferenceSchema } from '../types/enums';

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name is required')
    .max(60, 'Display name is too long'),
  email: z.string().email('Enter a valid email address').optional(),
  bio: z
    .string()
    .trim()
    .max(160, 'Bio must be 160 characters or less')
    .optional()
    .or(z.literal('')),
  languagePreference: languagePreferenceSchema.optional(),
  themePreference: themePreferenceSchema.optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export type ProfileInput = z.infer<typeof profileSchema>;
