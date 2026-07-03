import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccountWarningGate } from '../components/account/AccountWarningGate';
import { NotificationRegistrationGate } from '../components/notifications/NotificationRegistrationGate';
import { LanguageGate } from '../components/preferences/LanguageGate';
import { SentryUserGate } from '../components/telemetry/SentryUserGate';
import { initTelemetry } from '../lib/telemetry';
import { queryClient } from './query-client';
import '../i18n';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  initTelemetry();
  const content = (
    <QueryClientProvider client={queryClient}>
      {children}
      <LanguageGate />
      <SentryUserGate />
      <AccountWarningGate />
      <NotificationRegistrationGate />
    </QueryClientProvider>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>{content}</SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
