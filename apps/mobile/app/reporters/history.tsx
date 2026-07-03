import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../src/lib/query-keys';
import { fetchMyReporterSubmissions } from '../../src/services/reporters.service';
import { ReporterSubmissionItem } from '../../src/types/reporters';
import { formatPriceUnit } from '../../src/utils/formatPrice';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function ReporterHistoryScreen() {
  const insets = useSafeAreaInsets();
  const submissionsQuery = useQuery({
    queryKey: queryKeys.reporters.submissions,
    queryFn: fetchMyReporterSubmissions,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.title}>Submission history</Text>

      {submissionsQuery.isLoading ? (
        <SkeletonBox height={180} />
      ) : submissionsQuery.isError ? (
        <ErrorState onRetry={() => void submissionsQuery.refetch()} />
      ) : (submissionsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          headline="No submissions yet"
          body="Submit a fresh market price to start building your reporter profile."
        />
      ) : (
        <FlashList
          data={submissionsQuery.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SubmissionRow item={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

function SubmissionRow({ item }: { item: ReporterSubmissionItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.product}>{item.productName}</Text>
        <Text style={styles.meta}>
          {item.marketName} · {new Date(item.submittedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.trailing}>
        <Text style={styles.price}>{formatPriceUnit(item.priceNaira, item.unit)}</Text>
        <Text style={styles.status}>{item.status.replace('_', ' ')}</Text>
      </View>
    </View>
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
  list: {
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rowBody: {
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
  },
  trailing: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  status: {
    ...typography.caption,
    color: colors.green.primary,
    textTransform: 'capitalize',
  },
});
