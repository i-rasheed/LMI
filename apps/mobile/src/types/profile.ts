import { UserRole } from '@lmi/shared';

export interface ApiProfile {
  id: string;
  displayName: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  languagePreference: string;
  themePreference: string;
  accountStatus: string;
  bio: string | null;
  avatarUrl: string | null;
  onboardingCompletedAt: string | null;
  roleSelectedAt: string | null;
  guidelinesAcceptedAt: string | null;
  isPremium: boolean;
}

export function isBlockedAccount(accountStatus: string): boolean {
  return accountStatus === 'suspended' || accountStatus === 'banned';
}

export function needsRoleSelection(profile: Pick<ApiProfile, 'roleSelectedAt'>): boolean {
  return !profile.roleSelectedAt;
}

export function needsOnboarding(profile: Pick<ApiProfile, 'onboardingCompletedAt'>): boolean {
  return !profile.onboardingCompletedAt;
}
