import { z } from 'zod';

export const userRoleSchema = z.enum(['shopper', 'reporter', 'vendor', 'admin']);
export const accountStatusSchema = z.enum([
  'active',
  'suspended',
  'banned',
  'pending_deletion',
]);
export const languagePreferenceSchema = z.enum(['en', 'pcm']);
export const themePreferenceSchema = z.enum(['light', 'system']);
export const badgeLevelSchema = z.enum(['bronze', 'silver', 'gold', 'elite']);
export const priceUnitSchema = z.enum([
  'kg',
  'piece',
  'bunch',
  'litre',
  'crate',
  'bag',
]);
export const productCategorySchema = z.enum([
  'vegetables',
  'grains',
  'protein',
  'spices',
  'oils',
  'fruits',
  'other',
]);
export const priceSourceSchema = z.enum(['reporter', 'vendor']);
export const submissionStatusSchema = z.enum([
  'live',
  'flagged',
  'under_review',
  'removed',
]);
export const flagReasonSchema = z.enum(['incorrect_price', 'outdated', 'spam']);
export const claimStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export const vendorTierSchema = z.enum(['basic', 'pro']);

export type UserRole = z.infer<typeof userRoleSchema>;
export type AccountStatus = z.infer<typeof accountStatusSchema>;
export type LanguagePreference = z.infer<typeof languagePreferenceSchema>;
export type ThemePreference = z.infer<typeof themePreferenceSchema>;
export type BadgeLevel = z.infer<typeof badgeLevelSchema>;
export type PriceUnit = z.infer<typeof priceUnitSchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type PriceSource = z.infer<typeof priceSourceSchema>;
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;
export type FlagReason = z.infer<typeof flagReasonSchema>;
export type ClaimStatus = z.infer<typeof claimStatusSchema>;
export type VendorTier = z.infer<typeof vendorTierSchema>;

/** Signup roles only — admin is assigned server-side. */
export const signupRoleSchema = z.enum(['shopper', 'reporter', 'vendor']);
export type SignupRole = z.infer<typeof signupRoleSchema>;
