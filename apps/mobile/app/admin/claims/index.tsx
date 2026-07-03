import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../../src/lib/query-keys';
import { fetchClaimQueue } from '../../../src/services/admin.service';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function AdminClaimsQueueScreen() {
  const insets = useSafeAreaInsets();

  const claimsQuery = useQuery({
    queryKey: queryKeys.admin.claims,
    queryFn: fetchClaimQueue,
  });

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={claimsQuery.isRefetching}
          onRefresh={() => void claimsQuery.refetch()}
          tintColor={colors.green.primary}
        />
      }
    >
      <Text style={styles.title}>Claims queue</Text>
      <Text style={styles.subtitle}>Pending stall claims oldest first</Text>

      {claimsQuery.isLoading ? (
        <SkeletonBox height={120} />
      ) : claimsQuery.isError ? (
        <ErrorState onRetry={() => void claimsQuery.refetch()} />
      ) : (claimsQuery.data ?? []).length === 0 ? (
        <Text style={styles.empty}>No pending claims.</Text>
      ) : (
        (claimsQuery.data ?? []).map((claim) => (
          <Pressable
            key={claim.id}
            style={styles.card}
            onPress={() => router.push(`/admin/claims/${claim.id}`)}
          >
            <Text style={styles.stallName}>{claim.stallName}</Text>
            <Text style={styles.meta}>
              {claim.marketName} · {claim.marketArea}
            </Text>
            <Text style={styles.meta}>
              {claim.ownerDisplayName ?? 'Vendor'} ·{' '}
              {new Date(claim.createdAt).toLocaleDateString()}
            </Text>
          </Pressable>
        ))
      )}
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
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  stallName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  empty: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
