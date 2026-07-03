import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/auth/PrimaryButton';
import { ProductResultRow } from '../../src/components/catalogue/ProductResultRow';
import { SearchBar } from '../../src/components/catalogue/SearchBar';
import { PaywallPlaceholderModal } from '../../src/components/paywall/PaywallPlaceholderModal';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { useProductSearch } from '../../src/hooks/useProductSearch';
import { ApiError } from '../../src/lib/api';
import { queryKeys } from '../../src/lib/query-keys';
import { fetchFavourites } from '../../src/services/favourites.service';
import {
  addShoppingListItem,
  deleteShoppingListItem,
  fetchShoppingListItems,
} from '../../src/services/shopping-list.service';
import { ProductListItem } from '../../src/types/catalogue';
import { FavouriteItem } from '../../src/types/favourites-alerts';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function ListScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [paywallVisible, setPaywallVisible] = useState(false);

  const listQuery = useQuery({
    queryKey: queryKeys.shoppingList.items,
    queryFn: fetchShoppingListItems,
  });

  const favouritesQuery = useQuery({
    queryKey: queryKeys.favourites.all,
    queryFn: fetchFavourites,
  });

  const productSearchQuery = useProductSearch(query);

  const addMutation = useMutation({
    mutationFn: (productId: string) => addShoppingListItem({ productId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingList.items,
      });
      setSearchVisible(false);
      setQuery('');
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'FREEMIUM_LIMIT') {
        setPaywallVisible(true);
        return;
      }
      Alert.alert('Could not add item', 'Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShoppingListItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingList.items,
      });
    },
  });

  const items = listQuery.data ?? [];
  const favouriteProducts = (favouritesQuery.data ?? []).filter(
    (favourite) =>
      !items.some((item) => item.productId === favourite.productId),
  );

  const addProduct = (product: ProductListItem | FavouriteItem['product']) => {
    addMutation.mutate(product.id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My list</Text>
        <Text style={styles.subtitle}>Build a list and find the cheapest market</Text>
      </View>

      {listQuery.isLoading ? (
        <View style={styles.loading}>
          <SkeletonBox height={72} />
          <SkeletonBox height={72} />
        </View>
      ) : listQuery.isError ? (
        <ErrorState onRetry={() => void listQuery.refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={listQuery.isRefetching}
              onRefresh={() => void listQuery.refetch()}
              tintColor={colors.green.primary}
            />
          }
        >
          {items.length === 0 ? (
            <EmptyState
              headline="Your list is empty"
              body="Add products to compare total prices across markets."
              ctaLabel="Add item"
              onCtaPress={() => setSearchVisible(true)}
            />
          ) : (
            <View style={styles.cardList}>
              {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.quantity} {item.product.defaultUnit}
                    </Text>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() => deleteMutation.mutate(item.id)}
                    accessibilityLabel="Remove item"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.red.error}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={styles.addButton}
            onPress={() => setSearchVisible(true)}
          >
            <Ionicons name="add" size={20} color={colors.green.primary} />
            <Text style={styles.addButtonText}>Add item</Text>
          </Pressable>

          {favouriteProducts.length > 0 ? (
            <View style={styles.favouritesBlock}>
              <Text style={styles.sectionTitle}>Add from favourites</Text>
              {favouriteProducts.slice(0, 3).map((favourite) => (
                <Pressable
                  key={favourite.id}
                  style={styles.favouriteRow}
                  onPress={() => addProduct(favourite.product)}
                >
                  <Text style={styles.favouriteName}>
                    {favourite.product.name}
                  </Text>
                  <Text style={styles.addSmall}>Add</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label="Find Cheapest Market"
          disabled={items.length === 0}
          onPress={() => router.push('/list/result')}
        />
      </View>

      <Modal
        visible={searchVisible}
        animationType="slide"
        onRequestClose={() => setSearchVisible(false)}
      >
        <View style={[styles.searchContainer, { paddingTop: insets.top }]}>
          <View style={styles.searchHeader}>
            <Pressable onPress={() => setSearchVisible(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </Pressable>
            <Text style={styles.searchTitle}>Add product</Text>
            <View style={styles.headerSpacer} />
          </View>

          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search products"
            autoFocus
            showSpinner={productSearchQuery.isFetching}
          />

          <ScrollView contentContainerStyle={styles.searchResults}>
            {query.trim().length < 2 ? (
              <Text style={styles.searchHint}>Type at least 2 letters.</Text>
            ) : productSearchQuery.isError ? (
              <ErrorState onRetry={() => void productSearchQuery.refetch()} />
            ) : (productSearchQuery.data?.length ?? 0) === 0 &&
              !productSearchQuery.isFetching ? (
              <EmptyState headline="No products found" />
            ) : (
              productSearchQuery.data?.map((product) => (
                <ProductResultRow
                  key={product.id}
                  product={product}
                  onPress={() => addProduct(product)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      <PaywallPlaceholderModal
        visible={paywallVisible}
        title="Unlock unlimited list items"
        body="Free accounts can keep 5 shopping list items. Premium will unlock unlimited list items in M17."
        onClose={() => setPaywallVisible(false)}
      />
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
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
  },
  loading: {
    padding: spacing.screenHorizontal,
    gap: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  cardList: {
    gap: spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  itemMeta: {
    ...typography.caption,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.green.primary,
    minHeight: 48,
  },
  addButtonText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '700',
  },
  favouritesBlock: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.neutral[600],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  favouriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  favouriteName: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  addSmall: {
    ...typography.caption,
    color: colors.green.primary,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.md,
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  searchContainer: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
  },
  closeText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  searchTitle: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  headerSpacer: {
    width: 56,
  },
  searchResults: {
    paddingTop: spacing.md,
  },
  searchHint: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    padding: spacing.lg,
  },
});
