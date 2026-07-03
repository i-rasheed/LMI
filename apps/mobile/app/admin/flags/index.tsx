import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../../src/lib/query-keys';
import { supabase, isSupabaseConfigured } from '../../../src/lib/supabase';
import { fetchAdminDashboard, fetchFlagQueue } from '../../../src/services/admin.service';
import { formatPriceUnit } from '../../../src/utils/formatPrice';
import { colors, radius, spacing, typography } from '../../../src/theme';
import { FlagQueueItem } from '../../../src/types/flags';

export default function AdminFlagQueueScreen() {
  const insets = useSafeAreaInsets();

  const queueQuery = useQuery({
    queryKey: queryKeys.admin.flags(),
    queryFn: () => fetchFlagQueue(),
  });

  const dashboardQuery = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: fetchAdminDashboard,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel('admin-flag-reviews')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'flag_reviews' },
        () => {
          void queueQuery.refetch();
          void dashboardQuery.refetch();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queueQuery, dashboardQuery]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Flag queue</Text>
        <Text style={styles.subtitle}>
          {dashboardQuery.data?.pendingFlags ?? 0} pending
        </Text>
      </View>

      {queueQuery.isLoading ? (
        <View style={styles.loading}>
          <SkeletonBox height={88} />
          <SkeletonBox height={88} />
        </View>
      ) : queueQuery.isError ? (
        <ErrorState onRetry={() => void queueQuery.refetch()} />
      ) : (queueQuery.data?.length ?? 0) === 0 ? (
        <EmptyState headline="All caught up — no flagged prices" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={queueQuery.isRefetching}
              onRefresh={() => void queueQuery.refetch()}
              tintColor={colors.green.primary}
            />
          }
        >
          {queueQuery.data?.map((item: FlagQueueItem) => (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => router.push(`/admin/flags/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.product}>{item.productName}</Text>
                <Text style={styles.flags}>{item.flagCount} flags</Text>
              </View>
              <Text style={styles.meta}>
                {item.marketName} ·{' '}
                {formatPriceUnit(item.priceNaira, item.unit)}
              </Text>
              <Text style={styles.meta}>
                Reporter: {item.reporter.displayName}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
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
    gap: spacing.xs,
  },
  back: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
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
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  product: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
    flex: 1,
  },
  flags: {
    ...typography.caption,
    color: colors.amber.warning,
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.neutral[600],
  },
});
