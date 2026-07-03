import { useEffect } from 'react';
import { identifySentryUser } from '../../lib/telemetry';
import { useAuthStore } from '../../stores/authStore';

export function SentryUserGate() {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  useEffect(() => {
    identifySentryUser(userId);
  }, [userId]);

  return null;
}
