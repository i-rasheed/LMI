import { ApiProfile } from '../types/profile';
import { useAuthStore } from '../stores/authStore';

export function syncProfileToStore(profile: ApiProfile) {
  useAuthStore.getState().setProfile({
    id: profile.id,
    displayName: profile.displayName,
    role: profile.role,
    accountStatus: profile.accountStatus,
    onboardingCompletedAt: profile.onboardingCompletedAt,
    roleSelectedAt: profile.roleSelectedAt,
    guidelinesAcceptedAt: profile.guidelinesAcceptedAt,
    isPremium: profile.isPremium,
  });
}
