import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiRequest } from '../lib/api';
import { NotificationItem } from '../types/notifications';

const EXPLAINER_KEY = 'lmi:push-permission-explained';
const isExpoGo = Constants.appOwnership === 'expo';

type ExpoNotifications = typeof import('expo-notifications');

let notificationsPromise: Promise<ExpoNotifications | null> | null = null;

async function getNotifications(): Promise<ExpoNotifications | null> {
  if (Platform.OS === 'web' || isExpoGo) {
    return null;
  }

  notificationsPromise ??= import('expo-notifications').then((notifications) => {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    return notifications;
  });

  return notificationsPromise;
}

export function fetchNotifications(): Promise<NotificationItem[]> {
  return apiRequest<NotificationItem[]>('/notifications');
}

export function markNotificationRead(
  id: string,
): Promise<{ read: boolean }> {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function registerPushTokenIfPermitted(): Promise<void> {
  const notifications = await getNotifications();
  if (!notifications) {
    return;
  }

  const permissions = await notifications.getPermissionsAsync();
  if (permissions.status !== 'granted') {
    return;
  }

  await registerCurrentDevice(notifications);
}

export async function requestPushPermissionWithExplainer(): Promise<boolean> {
  const notifications = await getNotifications();
  if (!notifications) {
    return false;
  }

  const permissions = await notifications.getPermissionsAsync();
  if (permissions.status === 'granted') {
    await registerCurrentDevice(notifications);
    return true;
  }

  await AsyncStorage.setItem(EXPLAINER_KEY, '1');
  const nextPermissions = await notifications.requestPermissionsAsync();
  if (nextPermissions.status !== 'granted') {
    return false;
  }

  await registerCurrentDevice(notifications);
  return true;
}

export async function hasSeenPushExplainer(): Promise<boolean> {
  return (await AsyncStorage.getItem(EXPLAINER_KEY)) === '1';
}

export function markPushExplainerSeen(): Promise<void> {
  return AsyncStorage.setItem(EXPLAINER_KEY, '1');
}

async function registerCurrentDevice(
  notifications: ExpoNotifications,
): Promise<void> {
  if (!Device.isDevice || Platform.OS === 'web') {
    return;
  }

  const token = await getExpoPushToken(notifications);
  if (!token || (Platform.OS !== 'ios' && Platform.OS !== 'android')) {
    return;
  }

  await apiRequest('/devices/token', {
    method: 'POST',
    body: JSON.stringify({
      expoPushToken: token,
      deviceId: Device.modelId ?? Device.osBuildId ?? undefined,
      platform: Platform.OS,
    }),
  });
}

async function getExpoPushToken(
  notifications: ExpoNotifications,
): Promise<string | null> {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const tokenResult = projectId
    ? await notifications.getExpoPushTokenAsync({ projectId })
    : await notifications.getExpoPushTokenAsync();

  return tokenResult.data;
}
