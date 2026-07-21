import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../src/components/auth/PrimaryButton';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../../src/lib/query-keys';
import {
  fetchClaimStatus,
  fetchVendorDashboard,
} from '../../../src/services/vendors.service';
import { useAuthStore } from '../../../src/stores/authStore';
import { getUserDisplayName } from '../../../src/utils/user-display';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function VendorDashboardScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const displayName = getUserDisplayName(profile, user);
  const greeting = displayName ? `Hello, ${displayName}` : 'Hello';

  const claimQuery = useQuery({
    queryKey: queryKeys.vendor.claimStatus,
    queryFn: fetchClaimStatus,
  });

  const dashboardQuery = useQuery({
    queryKey: queryKeys.vendor.dashboard,
    queryFn: fetchVendorDashboard,
    enabled: claimQuery.data?.hasClaim === true,
  });

  useEffect(() => {
    if (claimQuery.data && !claimQuery.data.hasClaim) {
      router.replace('/vendor/claim/market');
    }
  }, [claimQuery.data]);

  const stall = dashboardQuery.data?.stall;
  const stats = dashboardQuery.data?.stats;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl + 56 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={claimQuery.isRefetching || dashboardQuery.isRefetching}
          onRefresh={() => {
            void claimQuery.refetch();
            void dashboardQuery.refetch();
          }}
          tintColor={colors.green.primary}
        />
      }
    >
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.title}>Vendor dashboard</Text>

      {claimQuery.isLoading || dashboardQuery.isLoading ? (
        <SkeletonBox height={160} />
      ) : claimQuery.isError || dashboardQuery.isError ? (
        <ErrorState
          onRetry={() => {
            void claimQuery.refetch();
            void dashboardQuery.refetch();
          }}
        />
      ) : stall ? (
        <>
          <View style={styles.card}>
            <Text style={styles.stallName}>
              {stall.stallName}
              {stall.isVerified ? ' ✓' : ''}
            </Text>
            <Text style={styles.marketMeta}>
              {stall.marketName} · {stall.marketArea}
            </Text>
            <Text style={styles.tierBadge}>
              {stall.vendorTier ? `${stall.vendorTier} tier` : 'Basic tier'}
            </Text>
            <Text style={styles.description}>{stall.description}</Text>
            <Text style={styles.locationHint}>{stall.locationHint}</Text>
            <View style={styles.tagRow}>
              {stall.categories.map((category) => (
                <View key={category} style={styles.tag}>
                  <Text style={styles.tagText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.profileViews7d ?? 0}</Text>
              <Text style={styles.statLabel}>Profile views (7d)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.productCount ?? 0}</Text>
              <Text style={styles.statLabel}>Products listed</Text>
            </View>
          </View>

          {stall.vendorTier === 'pro' ? (
            <View style={styles.statCardWide}>
              <Text style={styles.statValue}>{stats?.productClicks7d ?? 0}</Text>
              <Text style={styles.statLabel}>Product clicks (7d)</Text>
            </View>
          ) : (
            <View style={styles.upsellCard}>
              <Text style={styles.upsellTitle}>Unlock analytics with Pro</Text>
              <Text style={styles.upsellBody}>
                See profile views and product clicks over time.
              </Text>
              <Pressable onPress={() => router.push('/vendor/subscription')}>
                <Text style={styles.upsellLink}>Upgrade vendor plan</Text>
              </Pressable>
            </View>
          )}

          <PrimaryButton
            label="Add product"
            onPress={() => router.push('/vendor/product/add')}
          />

          <Pressable onPress={() => router.push('/(tabs)/home')}>
            <Text style={styles.link}>Browse as shopper</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/vendor/subscription')}>
            <Text style={styles.link}>Manage subscription</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.md,
  },
  greeting: {
    ...typography.body,
    color: colors.neutral[600],
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  banner: {
    backgroundColor: colors.green.light,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.xs,
  },
  bannerTitle: {
    ...typography.body,
    color: colors.green.dark,
    fontWeight: '700',
  },
  bannerBody: {
    ...typography.caption,
    color: colors.green.dark,
  },
  bannerLink: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.sm,
  },
  stallName: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  marketMeta: {
    ...typography.body,
    color: colors.neutral[600],
  },
  tierBadge: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  description: {
    ...typography.body,
    color: colors.neutral[900],
  },
  locationHint: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    ...typography.caption,
    color: colors.neutral[600],
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  statCardWide: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h1,
    color: colors.green.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  upsellCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  upsellTitle: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  upsellBody: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  upsellLink: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '700',
  },
  link: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
