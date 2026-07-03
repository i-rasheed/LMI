import { Href } from 'expo-router';
import { UserRole } from '@lmi/shared';
import {
  isBlockedAccount,
  needsOnboarding,
  needsRoleSelection,
} from '../types/profile';
import { useAuthStore } from '../stores/authStore';

export function getPostAuthRoute(profile: {
  role: UserRole;
  accountStatus: string;
  onboardingCompletedAt: string | null;
  roleSelectedAt: string | null;
} | null): Href {
  if (!profile) {
    return '/(auth)/role-select';
  }

  if (isBlockedAccount(profile.accountStatus)) {
    return '/blocked';
  }

  if (needsRoleSelection(profile)) {
    return '/(auth)/role-select';
  }

  if (needsOnboarding(profile)) {
    return '/(auth)/onboarding/step-1';
  }

  if (profile.role === 'vendor') {
    return '/(tabs)/vendor';
  }

  return '/(tabs)/home';
}

export function useAuthRedirectTarget(): Href | null {
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isProfileLoading = useAuthStore((state) => state.isProfileLoading);

  if (!isInitialized || isLoading || (session && isProfileLoading)) {
    return null;
  }

  if (!session) {
    return '/(auth)/welcome';
  }

  return getPostAuthRoute(profile);
}
