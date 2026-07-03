import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '../../src/components/catalogue/SearchBar';
import { SectionHeader } from '../../src/components/catalogue/SectionHeader';
import { SubmitStepHeader } from '../../src/components/submit/SubmitStepHeader';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { useLocation } from '../../src/hooks/useLocation';
import { useMarkets } from '../../src/hooks/useMarkets';
import {
  loadRecentMarkets,
  saveRecentMarket,
  useSubmitStore,
} from '../../src/stores/submitStore';
import { MarketListItem } from '../../src/types/catalogue';
import { RecentMarketEntry } from '../../src/types/submit';
import { colors, spacing, typography } from '../../src/theme';

function MarketRow({
  market,
  onPress,
}: {
  market: MarketListItem | RecentMarketEntry;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowTitle}>{market.name}</Text>
      <Text style={styles.rowMeta}>{market.area}</Text>
    </Pressable>
  );
}

export default function SubmitMarketScreen() {
  const insets = useSafeAreaInsets();
  const setMarket = useSubmitStore((state) => state.setMarket);
  const [query, setQuery] = useState('');
  const [recentMarkets, setRecentMarkets] = useState<RecentMarketEntry[]>([]);
  const { location } = useLocation();
  const marketsQuery = useMarkets({ location, enabled: true });

  useEffect(() => {
    void loadRecentMarkets().then(setRecentMarkets);
  }, []);

  const allMarkets = marketsQuery.data ?? [];

  const filteredMarkets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const sorted = [...allMarkets].sort((a, b) => a.name.localeCompare(b.name));
    if (!normalized) {
      return sorted;
    }
    return sorted.filter(
      (market) =>
        market.name.toLowerCase().includes(normalized) ||
        market.area.toLowerCase().includes(normalized),
    );
  }, [allMarkets, query]);

  const nearbyMarkets = useMemo(
    () =>
      location != null
        ? [...allMarkets]
            .filter((market) => market.distanceKm != null)
            .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
            .slice(0, 5)
        : [],
    [allMarkets, location],
  );

  const selectMarket = useCallback(
    async (market: MarketListItem | RecentMarketEntry) => {
      const entry: RecentMarketEntry = {
        id: market.id,
        name: market.name,
        area: market.area,
      };
      setMarket(entry);
      await saveRecentMarket(entry);
      router.push('/submit/product');
    },
    [setMarket],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SubmitStepHeader title="Select market" step={1} />

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search markets"
        autoFocus
      />

      {marketsQuery.isLoading ? (
        <View style={styles.loading}>
          <SkeletonBox height={56} />
          <SkeletonBox height={56} />
          <SkeletonBox height={56} />
        </View>
      ) : marketsQuery.isError ? (
        <ErrorState
          message="Could not load markets"
          onRetry={() => void marketsQuery.refetch()}
        />
      ) : (
        <FlashList
          data={filteredMarkets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            query.trim() ? null : (
              <View>
                {recentMarkets.length > 0 ? (
                  <View style={styles.section}>
                    <SectionHeader title="Recent markets" />
                    {recentMarkets.map((market) => (
                      <MarketRow
                        key={market.id}
                        market={market}
                        onPress={() => void selectMarket(market)}
                      />
                    ))}
                  </View>
                ) : null}
                {nearbyMarkets.length > 0 ? (
                  <View style={styles.section}>
                    <SectionHeader title="Near me" />
                    {nearbyMarkets.map((market) => (
                      <MarketRow
                        key={market.id}
                        market={market}
                        onPress={() => void selectMarket(market)}
                      />
                    ))}
                  </View>
                ) : null}
                <SectionHeader title="All markets" />
              </View>
            )
          }
          renderItem={({ item }) => (
            <MarketRow market={item} onPress={() => void selectMarket(item)} />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No markets match your search.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  loading: {
    padding: spacing.screenHorizontal,
    gap: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.md,
  },
  row: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    backgroundColor: colors.neutral[0],
  },
  rowTitle: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  rowMeta: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  empty: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    padding: spacing.xl,
  },
});
