import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../src/lib/query-keys';
import { fetchReporterProfile } from '../../src/services/reporters.service';
import { formatBadgeLabel } from '../../src/utils/reporter';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function ReporterProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const profileQuery = useQuery({
    queryKey: queryKeys.reporters.profile(id),
    queryFn: () => fetchReporterProfile(id),
    enabled: Boolean(id),
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {profileQuery.isLoading ? (
        <SkeletonBox height={220} />
      ) : profileQuery.isError ? (
        <ErrorState onRetry={() => void profileQuery.refetch()} />
      ) : profileQuery.data ? (
        <>
          <View style={styles.hero}>
            <Text style={styles.name}>{profileQuery.data.displayName}</Text>
            <Text style={styles.badge}>
              {formatBadgeLabel(profileQuery.data.badgeLevel) ?? 'Reporter'}
              {profileQuery.data.isVerifiedReporter ? ' · Verified' : ''}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <Stat
              label="Accepted prices"
              value={profileQuery.data.acceptedSubmissionCount}
            />
            <Stat label="Current streak" value={profileQuery.data.currentStreakDays} />
            <Stat label="Best streak" value={profileQuery.data.longestStreakDays} />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  hero: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.large,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  name: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  badge: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
  },
  statValue: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  statLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
});
