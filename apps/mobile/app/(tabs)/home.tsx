import { router } from 'expo-router';
import { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeSkeleton } from '../../src/components/catalogue/HomeSkeleton';
import { LocationBanner } from '../../src/components/catalogue/LocationBanner';
import { MarketCardRow } from '../../src/components/catalogue/MarketCard';
import { ProductChipRow } from '../../src/components/catalogue/ProductChip';
import { SearchBar } from '../../src/components/catalogue/SearchBar';
import { SectionHeader } from '../../src/components/catalogue/SectionHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { NetworkBanner } from '../../src/components/ui/NetworkBanner';
import { useLocation } from '../../src/hooks/useLocation';
import { useMarkets } from '../../src/hooks/useMarkets';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { useTrending } from '../../src/hooks/useTrending';
import { useAuthStore } from '../../src/stores/authStore';
import { MarketListItem, ProductListItem } from '../../src/types/catalogue';
import { colors, spacing, typography } from '../../src/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const displayName = useAuthStore((state) => state.profile?.displayName);
  const { isOffline } = useNetworkStatus();
  const {
    location,
    hasLocation,
    isDenied,
    isLoading: isLocationLoading,
    requestPermission,
  } = useLocation();

  const marketsQuery = useMarkets({
    location: hasLocation ? location : null,
  });
  const trendingQuery = useTrending();

  const isLoading =
    isLocationLoading ||
    marketsQuery.isLoading ||
    trendingQuery.isLoading;
  const hasError = marketsQuery.isError || trendingQuery.isError;

  const onRefresh = useCallback(() => {
    void marketsQuery.refetch();
    void trendingQuery.refetch();
  }, [marketsQuery, trendingQuery]);

  const openSearch = () => router.push('/(tabs)/search?focus=1');
  const openProduct = (product: ProductListItem) =>
    router.push(`/product/${product.id}`);
  const openMarket = (market: MarketListItem) =>
    router.push(`/market/${market.id}`);

  const greetingName = displayName?.split(' ')[0] ?? 'there';
  const areaLabel = hasLocation ? 'Near you' : 'Lagos';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isOffline ? <NetworkBanner /> : null}

      {isLoading ? (
        <HomeSkeleton />
      ) : hasError ? (
        <View style={styles.errorWrap}>
          <ErrorState
            headline="Couldn't load prices"
            message="Something went wrong. Try again."
            onRetry={onRefresh}
          />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={marketsQuery.isRefetching || trendingQuery.isRefetching}
              onRefresh={onRefresh}
              tintColor={colors.green.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.greeting}>
            Hello, {greetingName} · {areaLabel}
          </Text>

          <SearchBar editable={false} onPress={openSearch} />

          {isDenied && !hasLocation ? (
            <LocationBanner onEnablePress={() => void requestPermission()} />
          ) : null}

          <SectionHeader
            title={hasLocation ? 'Nearby markets' : 'Markets'}
          />

          {(marketsQuery.data?.length ?? 0) > 0 ? (
            <MarketCardRow
              markets={marketsQuery.data ?? []}
              onMarketPress={openMarket}
            />
          ) : (
            <EmptyState
              headline="See markets near you"
              body="Enable location to find markets closest to you."
              ctaLabel="Enable location"
              onCtaPress={() => void requestPermission()}
            />
          )}

          <SectionHeader title="Trending today" />

          {(trendingQuery.data?.length ?? 0) > 0 ? (
            <ProductChipRow
              products={trendingQuery.data ?? []}
              onProductPress={openProduct}
            />
          ) : (
            <EmptyState
              headline="Prices are being added"
              body="Check back soon for trending products."
              ctaLabel="Explore markets"
              onCtaPress={openSearch}
            />
          )}

          <SectionHeader title="Price drops" />
          <View style={styles.dropsPlaceholder}>
            <Text style={styles.dropsText}>
              Price drops will appear here when available.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  scrollContent: {
    paddingBottom: spacing['2xl'],
  },
  greeting: {
    ...typography.h2,
    color: colors.neutral[900],
    paddingHorizontal: spacing.screenHorizontal,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  dropsPlaceholder: {
    marginHorizontal: spacing.screenHorizontal,
    padding: spacing.md,
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
  },
  dropsText: {
    ...typography.body,
    color: colors.neutral[600],
  },
});
