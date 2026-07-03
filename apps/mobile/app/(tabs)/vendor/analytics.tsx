import { LineChart } from 'react-native-gifted-charts';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
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
  fetchVendorAnalytics,
  fetchVendorDashboard,
} from '../../../src/services/vendors.service';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function VendorAnalyticsScreen() {
  const insets = useSafeAreaInsets();

  const dashboardQuery = useQuery({
    queryKey: queryKeys.vendor.dashboard,
    queryFn: fetchVendorDashboard,
  });

  const analyticsQuery = useQuery({
    queryKey: queryKeys.vendor.analytics,
    queryFn: fetchVendorAnalytics,
    enabled: dashboardQuery.data?.stall?.vendorTier === 'pro',
  });

  const isPro = dashboardQuery.data?.stall?.vendorTier === 'pro';

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={dashboardQuery.isRefetching || analyticsQuery.isRefetching}
          onRefresh={() => {
            void dashboardQuery.refetch();
            void analyticsQuery.refetch();
          }}
          tintColor={colors.green.primary}
        />
      }
    >
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.subtitle}>Profile views and product clicks</Text>

      {dashboardQuery.isLoading ? (
        <SkeletonBox height={160} />
      ) : dashboardQuery.isError ? (
        <ErrorState onRetry={() => void dashboardQuery.refetch()} />
      ) : !isPro ? (
        <View style={styles.upsellCard}>
          <Text style={styles.upsellTitle}>Vendor Pro required</Text>
          <Text style={styles.upsellBody}>
            Upgrade to see profile views, product clicks, and promoted placement.
          </Text>
          <PrimaryButton
            label="Upgrade to Pro"
            onPress={() => router.push('/vendor/subscription')}
          />
        </View>
      ) : analyticsQuery.isLoading ? (
        <SkeletonBox height={220} />
      ) : analyticsQuery.isError ? (
        <ErrorState onRetry={() => void analyticsQuery.refetch()} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {analyticsQuery.data?.profileViews7d ?? 0}
              </Text>
              <Text style={styles.statLabel}>Views (7d)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {analyticsQuery.data?.productClicks7d ?? 0}
              </Text>
              <Text style={styles.statLabel}>Clicks (7d)</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Daily profile views</Text>
            <LineChart
              data={(analyticsQuery.data?.daily ?? []).map((point, index, all) => ({
                value: point.profileViews,
                label:
                  index === 0 || index === all.length - 1
                    ? point.date.slice(5)
                    : '',
              }))}
              height={160}
              color={colors.green.primary}
              thickness={3}
              curved
              yAxisColor={colors.neutral[100]}
              xAxisColor={colors.neutral[100]}
              rulesColor={colors.neutral[100]}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              noOfSections={4}
            />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Daily product clicks</Text>
            <LineChart
              data={(analyticsQuery.data?.daily ?? []).map((point, index, all) => ({
                value: point.productClicks,
                label:
                  index === 0 || index === all.length - 1
                    ? point.date.slice(5)
                    : '',
              }))}
              height={160}
              color={colors.amber.warning}
              thickness={3}
              curved
              yAxisColor={colors.neutral[100]}
              xAxisColor={colors.neutral[100]}
              rulesColor={colors.neutral[100]}
              yAxisTextStyle={styles.axisText}
              xAxisLabelTextStyle={styles.axisText}
              noOfSections={4}
            />
          </View>
        </>
      )}

      <Pressable onPress={() => router.push('/vendor/subscription')}>
        <Text style={styles.link}>Manage subscription</Text>
      </Pressable>
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
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
  },
  upsellCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  upsellTitle: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  upsellBody: {
    ...typography.body,
    color: colors.neutral[600],
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
  },
  statValue: {
    ...typography.h1,
    color: colors.green.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  chartCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.sm,
  },
  chartTitle: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  axisText: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  link: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
});
