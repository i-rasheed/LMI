import {
  OnboardingStep2Reporter,
  OnboardingStep2Shopper,
  OnboardingStep2Vendor,
} from '../../../src/components/auth/OnboardingStep';
import { useAuthStore } from '../../../src/stores/authStore';

export default function OnboardingStep2Screen() {
  const role = useAuthStore((state) => state.role);

  if (role === 'reporter') {
    return <OnboardingStep2Reporter />;
  }

  if (role === 'vendor') {
    return <OnboardingStep2Vendor />;
  }

  return <OnboardingStep2Shopper />;
}
