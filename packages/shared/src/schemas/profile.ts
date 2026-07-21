import { z } from 'zod';
import { languagePreferenceSchema, themePreferenceSchema } from '../types/enums';

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, 'Enter your name')
  .max(60, 'Name is too long');

export const profileSchema = z.object({
  displayName: displayNameSchema,
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

export const updateProfileSchema = z.object({
  displayName: displayNameSchema,
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
