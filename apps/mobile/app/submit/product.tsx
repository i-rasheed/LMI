import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryGrid } from '../../src/components/catalogue/CategoryGrid';
import { ProductResultRow } from '../../src/components/catalogue/ProductResultRow';
import { SearchBar } from '../../src/components/catalogue/SearchBar';
import { SectionHeader } from '../../src/components/catalogue/SectionHeader';
import { SubmitStepHeader } from '../../src/components/submit/SubmitStepHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { useProductSearch } from '../../src/hooks/useProductSearch';
import {
  useProductCategories,
  useProductsByCategory,
} from '../../src/hooks/useTrending';
import {
  loadRecentProducts,
  saveRecentProduct,
  useSubmitStore,
} from '../../src/stores/submitStore';
import { ProductCategory, ProductListItem } from '../../src/types/catalogue';
import { RecentProductEntry } from '../../src/types/submit';
import { colors, spacing, typography } from '../../src/theme';

export default function SubmitProductScreen() {
  const insets = useSafeAreaInsets();
  const marketName = useSubmitStore((state) => state.marketName);
  const setProduct = useSubmitStore((state) => state.setProduct);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);
  const [recentProducts, setRecentProducts] = useState<RecentProductEntry[]>([]);

  const searchQuery = useProductSearch(query);
  const categoriesQuery = useProductCategories();
  const categoryProductsQuery = useProductsByCategory(selectedCategory);

  useEffect(() => {
    void loadRecentProducts().then(setRecentProducts);
  }, []);

  const isSearching = query.trim().length >= 2;
  const showAutocomplete = isSearching && !selectedCategory;
  const showCategoryBrowse = selectedCategory != null && !isSearching;

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of categoriesQuery.data ?? []) {
      map[item.category] = item.productCount;
    }
    return map;
  }, [categoriesQuery.data]);

  const selectProduct = useCallback(
    async (product: ProductListItem | RecentProductEntry) => {
      const entry: RecentProductEntry = {
        id: product.id,
        name: product.name,
        defaultUnit: product.defaultUnit,
      };
      setProduct(entry);
      await saveRecentProduct(entry);
      router.push('/submit/price');
    },
    [setProduct],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SubmitStepHeader title="Select product" step={2} />

      {marketName ? (
        <Text style={styles.subtitle}>At {marketName}</Text>
      ) : null}

      <SearchBar
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          if (text.trim()) {
            setSelectedCategory(null);
          }
        }}
        placeholder="Search products"
        showSpinner={searchQuery.isFetching}
      />

      {showAutocomplete ? (
        searchQuery.isLoading ? (
          <View style={styles.loading}>
            <SkeletonBox height={56} />
            <SkeletonBox height={56} />
          </View>
        ) : searchQuery.isError ? (
          <ErrorState
            message="Search failed"
            onRetry={() => void searchQuery.refetch()}
          />
        ) : (searchQuery.data?.length ?? 0) === 0 ? (
          <EmptyState
            headline="No products found"
            body="Can't find product? Contact support."
            ctaLabel="Contact support"
            onCtaPress={() => void Linking.openURL('mailto:support@lmi.ng')}
          />
        ) : (
          <FlashList
            data={searchQuery.data ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductResultRow
                product={item}
                onPress={() => void selectProduct(item)}
              />
            )}
          />
        )
      ) : showCategoryBrowse ? (
        categoryProductsQuery.isLoading ? (
          <View style={styles.loading}>
            <SkeletonBox height={56} />
            <SkeletonBox height={56} />
          </View>
        ) : (
          <FlashList
            data={categoryProductsQuery.data ?? []}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <Pressable
                onPress={() => setSelectedCategory(null)}
                style={styles.backLink}
              >
                <Text style={styles.backLinkText}>← All categories</Text>
              </Pressable>
            }
            renderItem={({ item }) => (
              <ProductResultRow
                product={item}
                onPress={() => void selectProduct(item)}
              />
            )}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={styles.browseContent}>
          {recentProducts.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader title="Recent products" />
              {recentProducts.map((product) => (
                <Pressable
                  key={product.id}
                  style={styles.recentRow}
                  onPress={() => void selectProduct(product)}
                >
                  <Text style={styles.recentTitle}>{product.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <SectionHeader title="Browse by category" />
          <CategoryGrid
            counts={categoryCounts}
            onCategoryPress={setSelectedCategory}
          />
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
  subtitle: {
    ...typography.caption,
    color: colors.neutral[600],
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.sm,
  },
  loading: {
    padding: spacing.screenHorizontal,
    gap: spacing.sm,
  },
  browseContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.md,
  },
  recentRow: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  recentTitle: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  backLink: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
  },
  backLinkText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
});
