import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../../src/lib/query-keys';
import { fetchAdminDashboard } from '../../../src/services/admin.service';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function AdminHomeScreen() {
  const insets = useSafeAreaInsets();

  const dashboardQuery = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: fetchAdminDashboard,
  });

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={dashboardQuery.isRefetching}
          onRefresh={() => void dashboardQuery.refetch()}
          tintColor={colors.green.primary}
        />
      }
    >
      <Text style={styles.title}>Admin</Text>
      <Text style={styles.subtitle}>Moderation and catalogue tools</Text>

      {dashboardQuery.isLoading ? (
        <SkeletonBox height={100} />
      ) : dashboardQuery.isError ? (
        <ErrorState onRetry={() => void dashboardQuery.refetch()} />
      ) : (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {dashboardQuery.data?.pendingFlags ?? 0}
            </Text>
            <Text style={styles.summaryLabel}>Pending flags</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {dashboardQuery.data?.pendingClaims ?? 0}
            </Text>
            <Text style={styles.summaryLabel}>Pending claims</Text>
          </View>
        </View>
      )}

      <Pressable
        style={styles.linkCard}
        onPress={() => router.push('/admin/flags')}
      >
        <Text style={styles.linkTitle}>Flag queue</Text>
        <Text style={styles.linkBody}>Review flagged prices oldest first</Text>
      </Pressable>
      <Pressable
        style={styles.linkCard}
        onPress={() => router.push('/admin/claims')}
      >
        <Text style={styles.linkTitle}>Claims queue</Text>
        <Text style={styles.linkBody}>Approve or reject pending stall claims</Text>
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
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  summaryValue: {
    ...typography.h1,
    color: colors.green.primary,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  linkCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  linkTitle: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  linkBody: {
    ...typography.caption,
    color: colors.neutral[600],
  },
});
