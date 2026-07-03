import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';

export interface UserLocation {
  lat: number;
  lng: number;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setLocation(null);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch {
      setLocation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    if (status === Location.PermissionStatus.GRANTED) {
      await refresh();
    } else if (status === Location.PermissionStatus.DENIED) {
      await Linking.openSettings();
    }
    return status;
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    location,
    permissionStatus,
    isLoading,
    hasLocation: location != null,
    isDenied:
      permissionStatus != null &&
      permissionStatus !== Location.PermissionStatus.GRANTED,
    refresh,
    requestPermission,
    openSettings: () => Linking.openSettings(),
  };
}
