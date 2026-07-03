import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { acknowledgeWarning, fetchPendingWarnings } from '../../services/admin.service';
import { queryKeys } from '../../lib/query-keys';
import { AccountWarningModal } from './AccountWarningModal';
import { useAuthStore } from '../../stores/authStore';

export function AccountWarningGate() {
  const session = useAuthStore((state) => state.session);
  const [acknowledging, setAcknowledging] = useState(false);

  const warningsQuery = useQuery({
    queryKey: queryKeys.warnings.pending,
    queryFn: fetchPendingWarnings,
    enabled: Boolean(session),
  });

  const currentWarning = warningsQuery.data?.[0] ?? null;

  useEffect(() => {
    if (session) {
      void warningsQuery.refetch();
    }
  }, [session, warningsQuery]);

  async function handleAcknowledge() {
    if (!currentWarning) {
      return;
    }

    setAcknowledging(true);
    try {
      await acknowledgeWarning(currentWarning.id);
      await warningsQuery.refetch();
    } finally {
      setAcknowledging(false);
    }
  }

  return (
    <AccountWarningModal
      warning={currentWarning}
      loading={acknowledging}
      onAcknowledge={() => void handleAcknowledge()}
    />
  );
}
