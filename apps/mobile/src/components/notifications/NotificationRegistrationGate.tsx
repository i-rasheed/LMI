import { useEffect } from 'react';
import { registerPushTokenIfPermitted } from '../../services/notifications.service';
import { useAuthStore } from '../../stores/authStore';

export function NotificationRegistrationGate() {
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    if (!session) {
      return;
    }

    void registerPushTokenIfPermitted();
  }, [session]);

  return null;
}
