import { useQuery } from '@tanstack/react-query';
import { PlaceholderScreen } from '../src/components/PlaceholderScreen';
import { queryKeys } from '../src/lib/query-keys';
import { fetchAppConfig } from '../src/services/app-config.service';

export default function MaintenanceScreen() {
  const configQuery = useQuery({
    queryKey: queryKeys.appConfig,
    queryFn: fetchAppConfig,
  });

  return (
    <PlaceholderScreen
      title="Maintenance"
      subtitle={
        configQuery.data?.maintenanceMessage ??
        'LMI is temporarily unavailable. Try again soon.'
      }
    />
  );
}
