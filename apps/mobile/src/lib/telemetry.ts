import Constants from 'expo-constants';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
export const postHogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
export const postHogHost =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

const isExpoGo = Constants.appOwnership === 'expo';

let sentryInitialized = false;
let sentryPromise:
  | Promise<typeof import('@sentry/react-native')>
  | null = null;

function loadSentry(): Promise<typeof import('@sentry/react-native')> {
  sentryPromise ??= import('@sentry/react-native');
  return sentryPromise;
}

export function initTelemetry(): void {
  if (sentryInitialized || !sentryDsn || isExpoGo) {
    return;
  }

  sentryInitialized = true;
  void loadSentry().then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
      release: `lmi@${Constants.expoConfig?.version ?? '1.0.0'}`,
      tracesSampleRate: 0.1,
    });
  });
}

export function identifySentryUser(userId: string | null): void {
  if (isExpoGo) {
    return;
  }

  void loadSentry().then((Sentry) => {
    Sentry.setUser(userId ? { id: userId } : null);
  });
}
