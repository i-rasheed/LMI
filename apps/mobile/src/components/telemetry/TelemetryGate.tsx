import { useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';
import { useAuthStore } from '../../stores/authStore';

export function TelemetryGate() {
  const posthog = usePostHog();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    if (userId) {
      posthog.identify(userId, { role: role ?? 'shopper' });
      return;
    }

    posthog.reset();
  }, [posthog, role, userId]);

  return null;
}
