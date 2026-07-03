import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '../../../src/components/catalogue/SearchBar';
import { SectionHeader } from '../../../src/components/catalogue/SectionHeader';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../../src/components/ui/SkeletonBox';
import { useLocation } from '../../../src/hooks/useLocation';
import { useMarkets } from '../../../src/hooks/useMarkets';
import { MarketListItem } from '../../../src/types/catalogue';
import { colors, spacing, typography } from '../../../src/theme';

function MarketRow({
  market,
  onPress,
}: {
  market: MarketListItem;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowTitle}>{market.name}</Text>
      <Text style={styles.rowMeta}>{market.area}</Text>
    </Pressable>
  );
}

export default function VendorClaimMarketScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { location } = useLocation();
  const marketsQuery = useMarkets({ location, enabled: true });

  const filteredMarkets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const sorted = [...(marketsQuery.data ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    if (!normalized) {
      return sorted;
    }
    return sorted.filter(
      (market) =>
        market.name.toLowerCase().includes(normalized) ||
        market.area.toLowerCase().includes(normalized),
    );
  }, [marketsQuery.data, query]);

  const selectMarket = useCallback((market: MarketListItem) => {
    router.push({
      pathname: '/vendor/claim/stall',
      params: {
        marketId: market.id,
        marketName: market.name,
        marketArea: market.area,
      },
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Claim your stall</Text>
        <Text style={styles.subtitle}>Select the market where you sell</Text>
      </View>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search markets" />
      {marketsQuery.isLoading ? (
        <SkeletonBox height={120} />
      ) : marketsQuery.isError ? (
        <ErrorState onRetry={() => void marketsQuery.refetch()} />
      ) : (
        <FlashList
          data={filteredMarkets}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <SectionHeader title={`Markets (${filteredMarkets.length})`} />
          }
          renderItem={({ item }) => (
            <MarketRow market={item} onPress={() => selectMarket(item)} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  header: {
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  row: {
    backgroundColor: colors.neutral[0],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  rowTitle: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  rowMeta: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: 4,
  },
});
