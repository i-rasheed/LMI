import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  formatOpeningHours,
  MarketHoursBadge,
} from '../../src/components/market/MarketHoursBadge';
import { MarketMiniMap } from '../../src/components/market/MarketMiniMap';
import { FreshnessBadge } from '../../src/components/prices/FreshnessBadge';
import { ReporterBadge } from '../../src/components/prices/ReporterBadge';
import { SectionHeader } from '../../src/components/catalogue/SectionHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { NetworkBanner } from '../../src/components/ui/NetworkBanner';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { formatCategory } from '../../src/components/catalogue/ProductChip';
import { useMarketDetail } from '../../src/hooks/useMarketDetail';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { recordVendorAnalyticsEvent } from '../../src/services/vendors.service';
import { getFreshness } from '../../src/utils/freshness';
import { formatPriceUnit } from '../../src/utils/formatPrice';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function MarketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();
  const marketQuery = useMarketDetail(id);

  useEffect(() => {
    for (const stall of marketQuery.data?.vendorStalls ?? []) {
      void recordVendorAnalyticsEvent({
        vendorStallId: stall.id,
        eventType: 'profile_view',
      });
    }
  }, [marketQuery.data?.vendorStalls]);

  const openDirections = () => {
    const market = marketQuery.data;
    if (!market) {
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${market.latitude},${market.longitude}`;
    void Linking.openURL(url);
  };

  if (marketQuery.isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <SkeletonBox height={180} style={styles.heroSkeleton} />
        <SkeletonBox height={28} width="70%" style={styles.pad} />
        <SkeletonBox height={88} style={styles.pad} />
      </View>
    );
  }

  if (marketQuery.isError || !marketQuery.data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center' }]}>
        <ErrorState onRetry={() => void marketQuery.refetch()} />
      </View>
    );
  }

  const market = marketQuery.data;

  const header = (
    <View style={styles.header}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🏪</Text>
      </View>
      <View style={styles.headerContent}>
        <Text style={styles.name}>{market.name}</Text>
        <Text style={styles.area}>{market.area}</Text>
        <MarketHoursBadge openingHours={market.openingHours} />
        <Text style={styles.hours}>{formatOpeningHours(market.openingHours)}</Text>
        <View style={styles.tags}>
          {market.categories.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{formatCategory(tag)}</Text>
            </View>
          ))}
        </View>
      </View>

      <MarketMiniMap
        latitude={market.latitude}
        longitude={market.longitude}
        onPress={openDirections}
      />

      <Pressable style={styles.directionsButton} onPress={openDirections}>
        <Ionicons name="navigate-outline" size={18} color={colors.neutral[0]} />
        <Text style={styles.directionsText}>Get directions</Text>
      </Pressable>

      <SectionHeader title="Prices at this market" />

      {market.popularPrices.length === 0 ? (
        <EmptyState
          headline="Prices coming soon to this market"
          body="Check back later or explore other markets."
        />
      ) : null}

      {market.vendorStalls.length > 0 ? (
        <>
          <SectionHeader title="Vendor stalls" />
          {market.vendorStalls.map((stall) => (
            <View key={stall.id} style={styles.stallCard}>
              <Text style={styles.stallName}>
                {stall.stallName}
                {stall.isVerified ? ' ✓' : ''}
              </Text>
              {stall.isPromoted ? (
                <Text style={styles.promotedBadge}>Promoted Pro vendor</Text>
              ) : null}
              <Text style={styles.stallDescription} numberOfLines={2}>
                {stall.description}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isOffline ? <NetworkBanner /> : null}

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </Pressable>
      </View>

      <FlashList
        data={market.popularPrices}
        keyExtractor={(item) => `${item.productId}-${item.unit}`}
        renderItem={({ item }) => {
          const freshness = getFreshness(item.submittedAt);
          return (
            <Pressable
              style={styles.priceCard}
              onPress={() => router.push(`/product/${item.productId}`)}
            >
              <View style={styles.priceHeader}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.priceText}>
                  {formatPriceUnit(item.priceNaira, item.unit)}
                </Text>
              </View>
              <FreshnessBadge freshness={freshness} />
              <ReporterBadge
                displayName={item.submitterName}
                badgeLevel={item.badgeLevel}
              />
            </Pressable>
          );
        }}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={marketQuery.isRefetching}
            onRefresh={() => void marketQuery.refetch()}
            tintColor={colors.green.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  topBar: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  header: {
    paddingBottom: spacing.lg,
  },
  hero: {
    height: 160,
    backgroundColor: colors.green.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 56,
  },
  heroSkeleton: {
    marginBottom: spacing.md,
  },
  pad: {
    marginHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.sm,
  },
  headerContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  name: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  area: {
    ...typography.body,
    color: colors.neutral[600],
  },
  hours: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  tagText: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.screenHorizontal,
    marginTop: spacing.md,
    backgroundColor: colors.green.primary,
    borderRadius: radius.button,
    minHeight: 48,
  },
  directionsText: {
    ...typography.body,
    color: colors.neutral[0],
    fontWeight: '600',
  },
  priceCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    marginHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  productName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
    flex: 1,
  },
  priceText: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  stallCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    marginHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  stallName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  promotedBadge: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  stallDescription: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  listContent: {
    paddingBottom: spacing['2xl'],
  },
});
