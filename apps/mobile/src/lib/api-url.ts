import Constants from 'expo-constants';

const API_PORT = 3000;
const API_PATH = '/api/v1';

function getDevMachineHost(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri ??
    null;

  if (!debuggerHost || typeof debuggerHost !== 'string') {
    return null;
  }

  const host = debuggerHost.split(':')[0]?.trim();
  return host || null;
}

export function resolveApiUrl(): string {
  if (__DEV__) {
    const devHost = getDevMachineHost();
    if (devHost) {
      return `http://${devHost}:${API_PORT}${API_PATH}`;
    }
  }

  return (
    process.env.EXPO_PUBLIC_API_URL ?? `http://localhost:${API_PORT}${API_PATH}`
  );
}
