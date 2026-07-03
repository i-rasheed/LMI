import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { queryKeys } from '../../src/lib/query-keys';
import { optimiseShoppingList } from '../../src/services/shopping-list.service';
import { OptimisedMarket } from '../../src/types/shopping-list';
import { formatNaira, formatPriceUnit } from '../../src/utils/formatPrice';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function OptimiserResultScreen() {
  const insets = useSafeAreaInsets();
  const [expandedMarketId, setExpandedMarketId] = useState<string | null>(null);

  const optimiseQuery = useQuery({
    queryKey: queryKeys.shoppingList.optimise,
    queryFn: optimiseShoppingList,
  });

  const result = optimiseQuery.data;
  const best = result?.bestMarket ?? null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← My list</Text>
        </Pressable>
        <Text style={styles.title}>Cheapest market</Text>
      </View>

      {optimiseQuery.isLoading ? (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingTitle}>
            Finding the best deals across Lagos markets…
          </Text>
        </View>
      ) : optimiseQuery.isError ? (
        <ErrorState onRetry={() => void optimiseQuery.refetch()} />
      ) : !best ? (
        <EmptyState
          headline="No prices found"
          body="Add products with current market prices to optimise your trip."
          ctaLabel="Back to list"
          onCtaPress={() => router.back()}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Best market for your list</Text>
            <Text style={styles.summaryTitle}>{best.marketName}</Text>
            <Text style={styles.summaryBody}>
              Est. {formatNaira(best.totalCostNaira)} · {best.coverageCount}/
              {best.itemCount} items found
            </Text>
            <Pressable
              style={styles.viewMarketButton}
              onPress={() => router.push(`/market/${best.marketId}`)}
            >
              <Text style={styles.viewMarketText}>View market</Text>
            </Pressable>
          </View>

          <View style={styles.lockedCard}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.neutral[600]} />
            <Text style={styles.lockedText}>
              Premium unlocks savings vs most expensive market and travel
              distance.
            </Text>
          </View>

          {result?.markets.map((market) => (
            <MarketResultCard
              key={market.marketId}
              market={market}
              expanded={expandedMarketId === market.marketId}
              onToggle={() =>
                setExpandedMarketId((current) =>
                  current === market.marketId ? null : market.marketId,
                )
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function MarketResultCard({
  market,
  expanded,
  onToggle,
}: {
  market: OptimisedMarket;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.marketCard}>
      <Pressable style={styles.marketHeader} onPress={onToggle}>
        <View style={styles.marketText}>
          <Text style={styles.marketName}>{market.marketName}</Text>
          <Text style={styles.marketMeta}>
            {market.marketArea} · {market.coverageCount}/{market.itemCount} items found
          </Text>
        </View>
        <View style={styles.marketRight}>
          <Text style={styles.marketTotal}>
            {formatNaira(market.totalCostNaira)}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.neutral[600]}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.breakdown}>
          {market.breakdown.map((item) => (
            <View key={item.productId} style={styles.breakdownRow}>
              <View style={styles.breakdownNameWrap}>
                <Text style={styles.breakdownName}>{item.productName}</Text>
                <Text style={styles.breakdownMeta}>
                  Qty {item.quantity} {item.unit}
                </Text>
              </View>
              <Text style={styles.breakdownPrice}>
                {item.priceNaira == null || item.lineTotalNaira == null
                  ? 'N/A'
                  : `${formatPriceUnit(item.priceNaira, item.unit)} · ${formatNaira(
                      item.lineTotalNaira,
                    )}`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
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
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loadingTitle: {
    ...typography.h2,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.green.primary,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.neutral[0],
    opacity: 0.85,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryTitle: {
    ...typography.h2,
    color: colors.neutral[0],
  },
  summaryBody: {
    ...typography.body,
    color: colors.neutral[0],
  },
  viewMarketButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    justifyContent: 'center',
  },
  viewMarketText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  lockedText: {
    ...typography.caption,
    color: colors.neutral[600],
    flex: 1,
  },
  marketCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    overflow: 'hidden',
  },
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  marketText: {
    flex: 1,
  },
  marketName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  marketMeta: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  marketRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  marketTotal: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  breakdownNameWrap: {
    flex: 1,
  },
  breakdownName: {
    ...typography.caption,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  breakdownMeta: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  breakdownPrice: {
    ...typography.caption,
    color: colors.neutral[900],
    textAlign: 'right',
    flex: 1,
  },
});
