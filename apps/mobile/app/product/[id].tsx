import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaywallPlaceholderModal } from '../../src/components/paywall/PaywallPlaceholderModal';
import { AlertSheet } from '../../src/components/prices/AlertSheet';
import { FilterSheet } from '../../src/components/prices/FilterSheet';
import { FlagPriceSheet } from '../../src/components/prices/FlagPriceSheet';
import { PremiumHistoryLock } from '../../src/components/prices/PremiumHistoryLock';
import { PriceHistoryChart } from '../../src/components/prices/PriceHistoryChart';
import { PriceRow } from '../../src/components/prices/PriceRow';
import { ProductCompareFooter } from '../../src/components/prices/ProductCompareFooter';
import { SortBar } from '../../src/components/prices/SortBar';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { NetworkBanner } from '../../src/components/ui/NetworkBanner';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { formatCategory } from '../../src/components/catalogue/ProductChip';
import { useLocation } from '../../src/hooks/useLocation';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { usePriceCompare } from '../../src/hooks/usePriceCompare';
import { ApiError } from '../../src/lib/api';
import { queryKeys } from '../../src/lib/query-keys';
import { createAlert, fetchAlerts } from '../../src/services/alerts.service';
import { fetchPriceHistory } from '../../src/services/prices.service';
import { recordVendorAnalyticsEvent } from '../../src/services/vendors.service';
import {
  addFavourite,
  fetchFavourites,
  removeFavourite,
} from '../../src/services/favourites.service';
import {
  hasSeenPushExplainer,
  markPushExplainerSeen,
  requestPushPermissionWithExplainer,
} from '../../src/services/notifications.service';
import { useAuthStore } from '../../src/stores/authStore';
import { AlertThreshold } from '../../src/types/favourites-alerts';
import {
  CompareFilters,
  ComparePriceItem,
  CompareSort,
} from '../../src/types/prices';
import { colors, spacing, typography } from '../../src/theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const isPremium = useAuthStore((state) => state.profile?.isPremium ?? false);
  const session = useAuthStore((state) => state.session);
  const { isOffline } = useNetworkStatus();
  const { location } = useLocation();

  const [sort, setSort] = useState<CompareSort>('cheapest');
  const [filters, setFilters] = useState<CompareFilters>({});
  const [draftFilters, setDraftFilters] = useState<CompareFilters>({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [flagTarget, setFlagTarget] = useState<ComparePriceItem | null>(null);
  const [flagToast, setFlagToast] = useState<string | null>(null);
  const [alertSheetVisible, setAlertSheetVisible] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState<AlertThreshold>(15);
  const [paywall, setPaywall] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const compareQuery = usePriceCompare({
    productId: id,
    sort,
    location,
    filters,
  });

  const favouritesQuery = useQuery({
    queryKey: queryKeys.favourites.all,
    queryFn: fetchFavourites,
    enabled: Boolean(session),
  });

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts.all,
    queryFn: fetchAlerts,
    enabled: Boolean(session),
  });

  const historyQuery = useQuery({
    queryKey: queryKeys.prices.history(id),
    queryFn: () => fetchPriceHistory(id),
    enabled: Boolean(session && isPremium),
  });

  const favourite = favouritesQuery.data?.find(
    (item) => item.productId === id,
  );
  const productAlert = alertsQuery.data?.find(
    (item) => item.productId === id && item.isActive,
  );

  const showPaywallFromError = (error: unknown) => {
    if (error instanceof ApiError && error.code === 'FREEMIUM_LIMIT') {
      const resource = error.details?.resource;
      setPaywall({
        title:
          resource === 'alerts'
            ? 'Unlock unlimited alerts'
            : 'Unlock unlimited favourites',
        body:
          resource === 'alerts'
            ? 'Free accounts can keep 3 active alerts. Upgrade to Premium for unlimited alerts.'
            : 'Free accounts can save 10 favourites. Upgrade to Premium for unlimited favourites.',
      });
      return true;
    }
    return false;
  };

  async function explainPushBeforeValue(): Promise<void> {
    if (await hasSeenPushExplainer()) {
      return;
    }

    await new Promise<void>((resolve) => {
      Alert.alert(
        'Get notified at the right time',
        'LMI can send price drops and saved-product updates. You can continue even if you skip this.',
        [
          {
            text: 'Not now',
            style: 'cancel',
            onPress: () => {
              void markPushExplainerSeen().finally(resolve);
            },
          },
          {
            text: 'Enable',
            onPress: () => {
              void requestPushPermissionWithExplainer().finally(resolve);
            },
          },
        ],
      );
    });
  }

  const favouriteMutation = useMutation({
    mutationFn: async () => {
      if (favourite) {
        await removeFavourite(id);
        return null;
      }
      await explainPushBeforeValue();
      return addFavourite(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.favourites.all });
      setFlagToast(favourite ? 'Removed from favourites' : 'Saved to favourites');
      setTimeout(() => setFlagToast(null), 3000);
    },
    onError: (error) => {
      if (!showPaywallFromError(error)) {
        Alert.alert('Save failed', 'Please try again.');
      }
    },
  });

  const alertMutation = useMutation({
    mutationFn: async () => {
      await explainPushBeforeValue();
      return createAlert({
        productId: id,
        thresholdPercentage: alertThreshold,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
      setAlertSheetVisible(false);
      setFlagToast('Price alert saved');
      setTimeout(() => setFlagToast(null), 3000);
    },
    onError: (error) => {
      if (!showPaywallFromError(error)) {
        Alert.alert('Alert failed', 'Please try again.');
      }
    },
  });

  const listHeader = useMemo(() => {
    const product = compareQuery.data?.product;
    if (!product) {
      return null;
    }

    return (
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.subtitle}>
          {formatCategory(product.category)} · ref. {product.defaultUnit}
        </Text>
        {isPremium ? (
          <PriceHistoryChart points={historyQuery.data?.points ?? []} />
        ) : (
          <PremiumHistoryLock onPress={() => router.push('/premium/upgrade')} />
        )}
        <View style={styles.toolbar}>
          <SortBar value={sort} onChange={setSort} />
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              setDraftFilters(filters);
              setFilterVisible(true);
            }}
          >
            <Ionicons name="options-outline" size={18} color={colors.green.primary} />
            <Text style={styles.filterText}>Filter</Text>
          </Pressable>
        </View>
      </View>
    );
  }, [compareQuery.data?.product, filters, historyQuery.data?.points, isPremium, sort]);

  function openPriceMarket(item: ComparePriceItem) {
    if (item.vendorStallId) {
      void recordVendorAnalyticsEvent({
        vendorStallId: item.vendorStallId,
        eventType: 'product_click',
        productId: id,
      });
    }
    router.push(`/market/${item.marketId}`);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isOffline ? <NetworkBanner /> : null}

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </Pressable>
      </View>

      {compareQuery.isLoading ? (
        <View style={styles.loading}>
          <SkeletonBox height={32} width="60%" />
          <SkeletonBox height={88} />
          <SkeletonBox height={88} />
          <SkeletonBox height={88} />
        </View>
      ) : compareQuery.isError ? (
        <ErrorState onRetry={() => void compareQuery.refetch()} />
      ) : (
        <>
          <FlashList
            data={compareQuery.data?.prices ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PriceRow
                price={item}
                onPress={() => openPriceMarket(item)}
                onReporterPress={() => router.push(`/reporters/${item.submitter.id}`)}
                onFlagPress={
                  session
                    ? () => setFlagTarget(item)
                    : undefined
                }
                showUnderReview={item.status === 'under_review'}
              />
            )}
            ListHeaderComponent={
              <>
                {listHeader}
                {flagToast ? (
                  <Text style={styles.toast}>{flagToast}</Text>
                ) : null}
              </>
            }
            ListEmptyComponent={
              <EmptyState
                headline="No prices yet for this product"
                body="Be the first to know when prices are added."
                ctaLabel={
                  role === 'reporter' ? 'Submit a price' : 'Set alert for first price'
                }
                onCtaPress={() =>
                  Alert.alert(
                    role === 'reporter' ? 'Submit price' : 'Set alert',
                    'Coming in a later milestone.',
                  )
                }
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={compareQuery.isRefetching}
                onRefresh={() => void compareQuery.refetch()}
                tintColor={colors.green.primary}
              />
            }
            contentContainerStyle={styles.listContent}
          />
          <ProductCompareFooter
            compare={compareQuery.data}
            isFavourite={Boolean(favourite)}
            hasAlert={Boolean(productAlert)}
            onToggleFavourite={() => favouriteMutation.mutate()}
            onOpenAlert={() => {
              setAlertThreshold(productAlert?.thresholdPercentage ?? 15);
              setAlertSheetVisible(true);
            }}
          />
        </>
      )}

      <FilterSheet
        visible={filterVisible}
        filters={draftFilters}
        onChange={setDraftFilters}
        onClose={() => setFilterVisible(false)}
        onApply={() => {
          setFilters(draftFilters);
          setFilterVisible(false);
        }}
      />

      <FlagPriceSheet
        visible={flagTarget != null}
        submissionId={flagTarget?.submissionId ?? null}
        onClose={() => setFlagTarget(null)}
        onSuccess={() => {
          setFlagToast("Thanks — we'll review this price");
          void compareQuery.refetch();
          setTimeout(() => setFlagToast(null), 3000);
        }}
      />

      <AlertSheet
        visible={alertSheetVisible}
        threshold={alertThreshold}
        loading={alertMutation.isPending}
        onChangeThreshold={setAlertThreshold}
        onClose={() => setAlertSheetVisible(false)}
        onSubmit={() => alertMutation.mutate()}
      />

      <PaywallPlaceholderModal
        visible={paywall != null}
        title={paywall?.title ?? ''}
        body={paywall?.body ?? ''}
        onClose={() => setPaywall(null)}
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
  headerBlock: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
    paddingHorizontal: spacing.screenHorizontal,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
    paddingHorizontal: spacing.screenHorizontal,
  },
  toolbar: {
    gap: spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginRight: spacing.screenHorizontal,
    padding: spacing.sm,
  },
  filterText: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '600',
  },
  loading: {
    padding: spacing.screenHorizontal,
    gap: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  toast: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.sm,
  },
});
