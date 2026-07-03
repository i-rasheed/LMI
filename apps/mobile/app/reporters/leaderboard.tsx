import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../src/lib/query-keys';
import { fetchReporterLeaderboard } from '../../src/services/reporters.service';
import { ReporterLeaderboardItem } from '../../src/types/reporters';
import { formatBadgeLabel } from '../../src/utils/reporter';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function ReporterLeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const leaderboardQuery = useQuery({
    queryKey: queryKeys.reporters.leaderboard,
    queryFn: fetchReporterLeaderboard,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>Top reporters this week</Text>
      <Text style={styles.subtitle}>Fresh prices help everyone shop smarter.</Text>

      {leaderboardQuery.isLoading ? (
        <View style={styles.skeletons}>
          <SkeletonBox height={72} />
          <SkeletonBox height={72} />
          <SkeletonBox height={72} />
        </View>
      ) : leaderboardQuery.isError ? (
        <ErrorState onRetry={() => void leaderboardQuery.refetch()} />
      ) : (
        <FlashList
          data={leaderboardQuery.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReporterRow item={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

function ReporterRow({ item }: { item: ReporterLeaderboardItem }) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push(`/reporters/${item.id}`)}
    >
      <Text style={styles.rank}>#{item.rank}</Text>
      <View style={styles.rowBody}>
        <Text style={styles.name}>{item.displayName}</Text>
        <Text style={styles.meta}>
          {formatBadgeLabel(item.badgeLevel) ?? 'Reporter'} ·{' '}
          {item.weeklySubmissionCount} this week
        </Text>
      </View>
      <Text style={styles.count}>{item.acceptedSubmissionCount}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.screenHorizontal,
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
  skeletons: {
    gap: spacing.sm,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rank: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
    width: 44,
  },
  rowBody: {
    flex: 1,
  },
  name: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  meta: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  count: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
});
