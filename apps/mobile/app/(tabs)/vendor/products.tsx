import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../src/components/auth/PrimaryButton';
import { ErrorState } from '../../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../../src/components/ui/SkeletonBox';
import { queryKeys } from '../../../src/lib/query-keys';
import {
  fetchClaimStatus,
  fetchVendorProducts,
} from '../../../src/services/vendors.service';
import { colors, radius, spacing, typography } from '../../../src/theme';

export default function VendorProductsScreen() {
  const insets = useSafeAreaInsets();

  const claimQuery = useQuery({
    queryKey: queryKeys.vendor.claimStatus,
    queryFn: fetchClaimStatus,
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.vendor.products,
    queryFn: fetchVendorProducts,
    enabled: claimQuery.data?.hasClaim === true,
  });

  const canPublish = claimQuery.data?.hasClaim === true;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={claimQuery.isRefetching || productsQuery.isRefetching}
          onRefresh={() => {
            void claimQuery.refetch();
            void productsQuery.refetch();
          }}
          tintColor={colors.green.primary}
        />
      }
    >
      <Text style={styles.title}>Products</Text>
      <Text style={styles.subtitle}>Manage your stall listings</Text>

      {!canPublish ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Set up your stall first</Text>
          <Text style={styles.noticeBody}>
            Claim your market stall before you can publish products.
          </Text>
          <Pressable onPress={() => router.push('/vendor/claim/market')}>
            <Text style={styles.noticeLink}>Claim your stall</Text>
          </Pressable>
        </View>
      ) : null}

      {canPublish ? (
        <PrimaryButton
          label="Add product"
          onPress={() => router.push('/vendor/product/add')}
        />
      ) : null}

      {canPublish && productsQuery.isLoading ? (
        <SkeletonBox height={120} />
      ) : canPublish && productsQuery.isError ? (
        <ErrorState onRetry={() => void productsQuery.refetch()} />
      ) : (
        (productsQuery.data ?? []).map((product) => (
          <Pressable
            key={product.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/vendor/product/[action]',
                params: { action: 'edit', id: product.id },
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.productName}>{product.productName}</Text>
              <Text style={styles.statusBadge}>
                {product.isAvailableToday ? 'Live' : 'Hidden'}
              </Text>
            </View>
            <Text style={styles.price}>
              ₦{product.priceNaira.toLocaleString()} / {product.unit}
            </Text>
            <Text style={styles.meta}>{product.category}</Text>
          </Pressable>
        ))
      )}

      {canPublish && (productsQuery.data?.length ?? 0) === 0 && !productsQuery.isLoading ? (
        <Text style={styles.empty}>No products listed yet.</Text>
      ) : null}
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
  notice: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  noticeTitle: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  noticeBody: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  noticeLink: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  productName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '700',
  },
  price: {
    ...typography.body,
    color: colors.neutral[900],
  },
  meta: {
    ...typography.caption,
    color: colors.neutral[600],
    textTransform: 'capitalize',
  },
  empty: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
