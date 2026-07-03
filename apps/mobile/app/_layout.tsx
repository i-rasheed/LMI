import 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { useQuery } from '@tanstack/react-query';

LogBox.ignoreLogs([
  'setLayoutAnimationEnabledExperimental is currently a no-op',
]);
import { AppProviders } from '../src/providers/AppProviders';
import { useAuthInitialization } from '../src/hooks/useAuthInitialization';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { queryKeys } from '../src/lib/query-keys';
import { fetchAppConfig } from '../src/services/app-config.service';
import { useAuthStore } from '../src/stores/authStore';
import { colors } from '../src/theme';
import { compareVersions } from '../src/utils/version';

function RootNavigator() {
  useAuthInitialization();
  const pathname = usePathname();
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const configQuery = useQuery({
    queryKey: queryKeys.appConfig,
    queryFn: fetchAppConfig,
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    const config = configQuery.data;
    if (!config) {
      return;
    }

    if (config.maintenanceMode && pathname !== '/maintenance') {
      router.replace('/maintenance');
      return;
    }

    const currentVersion = Constants.expoConfig?.version ?? '1.0.0';
    if (
      compareVersions(currentVersion, config.minAppVersion) < 0 &&
      pathname !== '/force-update'
    ) {
      router.replace('/force-update');
    }
  }, [configQuery.data, pathname]);

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="market/[id]" />
        <Stack.Screen name="submit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="admin" />
        <Stack.Screen name="vendor" />
        <Stack.Screen name="premium/upgrade" />
        <Stack.Screen name="list/result" />
        <Stack.Screen name="profile/favourites" />
        <Stack.Screen name="profile/subscription" />
        <Stack.Screen name="profile/delete-account" />
        <Stack.Screen name="reporters/leaderboard" />
        <Stack.Screen name="reporters/history" />
        <Stack.Screen name="reporters/[id]" />
        <Stack.Screen name="blocked" />
        <Stack.Screen name="maintenance" />
        <Stack.Screen name="force-update" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
