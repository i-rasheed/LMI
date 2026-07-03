export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  userMetadata?: Record<string, unknown>;
}

export interface ProfileRow {
  id: string;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  language_preference: string;
  theme_preference: string;
  account_status: string;
  bio: string | null;
  avatar_url: string | null;
  onboarding_completed_at: string | null;
  guidelines_accepted_at: string | null;
  role_selected_at: string | null;
  deleted_at: string | null;
  permanent_delete_at: string | null;
  is_verified_reporter: boolean;
  current_badge_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  id: string;
  displayName: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  languagePreference: string;
  themePreference: string;
  accountStatus: string;
  bio: string | null;
  avatarUrl: string | null;
  onboardingCompletedAt: string | null;
  guidelinesAcceptedAt: string | null;
  roleSelectedAt: string | null;
  isVerifiedReporter: boolean;
  currentBadgeLevel: string | null;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toProfileResponse(
  row: ProfileRow,
  isPremium: boolean,
): ProfileResponse {
  return {
    id: row.id,
    displayName: row.display_name,
    phone: row.phone,
    email: row.email,
    role: row.role,
    languagePreference: row.language_preference,
    themePreference: row.theme_preference,
    accountStatus: row.account_status,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    onboardingCompletedAt: row.onboarding_completed_at,
    guidelinesAcceptedAt: row.guidelines_accepted_at,
    roleSelectedAt: row.role_selected_at,
    isVerifiedReporter: row.is_verified_reporter,
    currentBadgeLevel: row.current_badge_level,
    isPremium,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
