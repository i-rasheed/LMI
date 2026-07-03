import { UserRole } from '@lmi/shared';
import { useQuery } from '@tanstack/react-query';
import { Redirect, Tabs, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { queryKeys } from '../../src/lib/query-keys';
import { fetchNotifications } from '../../src/services/notifications.service';
import { useAuthStore } from '../../src/stores/authStore';
import { colors } from '../../src/theme';

type TabVariant = 'shopper' | 'vendor' | 'admin';

function resolveTabVariant(role: UserRole | null): TabVariant {
  if (role === 'vendor') {
    return 'vendor';
  }
  if (role === 'admin') {
    return 'admin';
  }
  return 'shopper';
}

function ReporterFab() {
  const guidelinesAcceptedAt = useAuthStore(
    (state) => state.profile?.guidelinesAcceptedAt,
  );

  return (
    <Pressable
      style={styles.fab}
      accessibilityLabel="Submit price"
      onPress={() => {
        if (!guidelinesAcceptedAt) {
          router.push('/submit/guidelines');
          return;
        }
        router.push('/submit');
      }}
    >
      <Ionicons name="add" size={28} color={colors.neutral[0]} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const session = useAuthStore((state) => state.session);
  const role = useAuthStore((state) => state.role);
  const insets = useSafeAreaInsets();
  const variant = resolveTabVariant(role);
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.inbox,
    queryFn: fetchNotifications,
    enabled: Boolean(session),
  });
  const unreadCount =
    notificationsQuery.data?.filter((item) => !item.readAt).length ?? 0;

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: colors.green.primary,
    tabBarInactiveTintColor: colors.neutral[600],
    tabBarStyle: {
      backgroundColor: colors.neutral[0],
      borderTopColor: colors.neutral[100],
      height: 56 + insets.bottom,
      paddingBottom: insets.bottom,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
  };

  if (variant === 'vendor') {
    return (
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="home"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="search"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="list"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="alerts"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="vendor/index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="storefront-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="vendor/products"
          options={{
            title: 'Products',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pricetag-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="vendor/analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin/index"
          options={{ href: null }}
        />
      </Tabs>
    );
  }

  return (
    <View style={styles.container}>
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="list"
          options={{
            title: 'My list',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="vendor/index"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="vendor/products"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="vendor/analytics"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="admin/index"
          options={
            variant === 'admin'
              ? {
                  title: 'Admin',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="shield-outline" size={size} color={color} />
                  ),
                }
              : { href: null }
          }
        />
      </Tabs>
      {role === 'reporter' ? <ReporterFab /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 72,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.green.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A8F52',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 6,
  },
});
