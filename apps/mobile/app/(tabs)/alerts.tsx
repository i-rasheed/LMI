import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Href, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaywallPlaceholderModal } from '../../src/components/paywall/PaywallPlaceholderModal';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { ApiError } from '../../src/lib/api';
import { queryKeys } from '../../src/lib/query-keys';
import {
  deleteAlert,
  fetchAlerts,
  updateAlert,
} from '../../src/services/alerts.service';
import {
  fetchNotifications,
  markNotificationRead,
} from '../../src/services/notifications.service';
import { PriceAlertItem } from '../../src/types/favourites-alerts';
import { NotificationItem } from '../../src/types/notifications';
import { formatNaira } from '../../src/utils/formatPrice';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [paywallVisible, setPaywallVisible] = useState(false);

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts.all,
    queryFn: fetchAlerts,
  });

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.inbox,
    queryFn: fetchNotifications,
  });

  const toggleMutation = useMutation({
    mutationFn: (alert: PriceAlertItem) =>
      updateAlert(alert.id, { isActive: !alert.isActive }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'FREEMIUM_LIMIT') {
        setPaywallVisible(true);
        return;
      }
      Alert.alert('Could not update alert', 'Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.inbox,
      });
    },
  });

  const alerts = alertsQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];

  function openNotification(item: NotificationItem) {
    if (!item.readAt) {
      readMutation.mutate(item.id);
    }

    const route = item.data.route;
    if (typeof route === 'string' && route.startsWith('/')) {
      router.push(route as Href);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <Text style={styles.subtitle}>Price drop alerts and activity</Text>
      </View>

      {alertsQuery.isLoading || notificationsQuery.isLoading ? (
        <View style={styles.loading}>
          <SkeletonBox height={88} />
          <SkeletonBox height={88} />
        </View>
      ) : alertsQuery.isError || notificationsQuery.isError ? (
        <ErrorState
          onRetry={() => {
            void alertsQuery.refetch();
            void notificationsQuery.refetch();
          }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={
                alertsQuery.isRefetching || notificationsQuery.isRefetching
              }
              onRefresh={() => {
                void alertsQuery.refetch();
                void notificationsQuery.refetch();
              }}
              tintColor={colors.green.primary}
            />
          }
        >
          <Text style={styles.sectionTitle}>Alerts</Text>
          {alerts.length === 0 ? (
            <EmptyState
              headline="Get notified when prices drop"
              body="Set alerts from any product comparison page."
              ctaLabel="Search products"
              onCtaPress={() => router.push('/(tabs)/search')}
            />
          ) : (
            alerts.map((item) => (
              <View key={item.id} style={styles.card}>
                <Pressable
                  style={styles.cardMain}
                  onPress={() => router.push(`/product/${item.productId}`)}
                >
                  <Text style={styles.product}>{item.product.name}</Text>
                  <Text style={styles.meta}>
                    {item.thresholdPercentage === 0
                      ? 'Any price drop'
                      : `${item.thresholdPercentage}% drop`}
                    {item.lastKnownPriceNaira != null
                      ? ` · last ${formatNaira(item.lastKnownPriceNaira)}`
                      : ''}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.toggle,
                    item.isActive ? styles.toggleOn : styles.toggleOff,
                  ]}
                  onPress={() => toggleMutation.mutate(item)}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      item.isActive && styles.toggleKnobOn,
                    ]}
                  />
                </Pressable>

                <Pressable
                  hitSlop={8}
                  onPress={() => deleteMutation.mutate(item.id)}
                  accessibilityLabel="Delete alert"
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.neutral[600]}
                  />
                </Pressable>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Activity</Text>
          {notifications.length === 0 ? (
            <View style={styles.inboxCard}>
              <Text style={styles.inboxTitle}>No notifications yet</Text>
              <Text style={styles.inboxBody}>
                Price drops and account activity will appear here.
              </Text>
            </View>
          ) : (
            notifications.map((item) => (
              <Pressable
                key={item.id}
                style={styles.inboxCard}
                onPress={() => openNotification(item)}
              >
                <View style={styles.inboxHeader}>
                  <Text style={styles.inboxTitle}>{item.title}</Text>
                  {!item.readAt ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.inboxBody}>{item.body}</Text>
                <Text style={styles.inboxMeta}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}

      <PaywallPlaceholderModal
        visible={paywallVisible}
        title="Unlock unlimited alerts"
        body="Free accounts can keep 3 active alerts. Premium will unlock unlimited alerts in M17."
        onClose={() => setPaywallVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
  },
  loading: {
    padding: spacing.screenHorizontal,
    gap: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.neutral[900],
    marginTop: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.md,
  },
  cardMain: {
    flex: 1,
  },
  product: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
  },
  toggleOn: {
    backgroundColor: colors.green.primary,
  },
  toggleOff: {
    backgroundColor: colors.neutral[400],
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.neutral[0],
  },
  toggleKnobOn: {
    transform: [{ translateX: 18 }],
  },
  inboxCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  inboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  inboxTitle: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  inboxBody: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  inboxMeta: {
    ...typography.caption,
    color: colors.neutral[400],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green.primary,
  },
});
