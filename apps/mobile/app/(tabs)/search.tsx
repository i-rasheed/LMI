import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryGrid } from '../../src/components/catalogue/CategoryGrid';
import { ProductChipRow } from '../../src/components/catalogue/ProductChip';
import { ProductResultRow } from '../../src/components/catalogue/ProductResultRow';
import { SearchBar } from '../../src/components/catalogue/SearchBar';
import { SectionHeader } from '../../src/components/catalogue/SectionHeader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { NetworkBanner } from '../../src/components/ui/NetworkBanner';
import { SkeletonBox } from '../../src/components/ui/SkeletonBox';
import { useProductSearch } from '../../src/hooks/useProductSearch';
import {
  useProductCategories,
  useProductsByCategory,
  useTrending,
} from '../../src/hooks/useTrending';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { queryKeys } from '../../src/lib/query-keys';
import { fetchAiSearchSuggestions } from '../../src/services/ai.service';
import { ProductCategory, ProductListItem } from '../../src/types/catalogue';
import { colors, spacing, typography } from '../../src/theme';
import { useTranslation } from 'react-i18next';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ focus?: string }>();
  const { t } = useTranslation();
  const shouldFocus = params.focus === '1';

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);

  const { isOffline } = useNetworkStatus();
  const searchQuery = useProductSearch(query);
  const aiSearchQuery = useQuery({
    queryKey: queryKeys.ai.search(query.trim()),
    queryFn: () => fetchAiSearchSuggestions(query.trim()),
    enabled:
      query.trim().length >= 2 &&
      !searchQuery.isLoading &&
      !searchQuery.isError &&
      (searchQuery.data?.length ?? 0) === 0,
  });
  const trendingQuery = useTrending();
  const categoriesQuery = useProductCategories();
  const categoryProductsQuery = useProductsByCategory(selectedCategory);

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

  const openProduct = useCallback(
    (product: ProductListItem) => router.push(`/product/${product.id}`),
    [],
  );

  const onRefresh = useCallback(() => {
    void trendingQuery.refetch();
    void categoriesQuery.refetch();
    if (selectedCategory) {
      void categoryProductsQuery.refetch();
    }
    if (isSearching) {
      void searchQuery.refetch();
    }
  }, [
    trendingQuery,
    categoriesQuery,
    categoryProductsQuery,
    searchQuery,
    selectedCategory,
    isSearching,
  ]);

  const clearCategory = () => setSelectedCategory(null);

  const listData = showCategoryBrowse
    ? (categoryProductsQuery.data ?? [])
    : showAutocomplete
      ? (searchQuery.data ?? [])
      : [];

  const listLoading = showCategoryBrowse
    ? categoryProductsQuery.isLoading
    : showAutocomplete
      ? searchQuery.isLoading
      : false;

  const listError = showCategoryBrowse
    ? categoryProductsQuery.isError
    : showAutocomplete
      ? searchQuery.isError
      : false;

  const showNoResults =
    showAutocomplete &&
    !searchQuery.isLoading &&
    !searchQuery.isError &&
    (searchQuery.data?.length ?? 0) === 0 &&
    query.trim().length >= 2;

  if (showAutocomplete || showCategoryBrowse) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {isOffline ? <NetworkBanner /> : null}
        <SearchBar
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (text.trim()) {
              setSelectedCategory(null);
            }
          }}
          autoFocus={shouldFocus}
          showSpinner={searchQuery.isFetching && !searchQuery.isLoading}
          placeholder={t('search.placeholder')}
        />

        {selectedCategory ? (
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>
              {selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)}
            </Text>
            <Pressable onPress={clearCategory}>
              <Text style={styles.clearLink}>Clear</Text>
            </Pressable>
          </View>
        ) : null}

        {listLoading ? (
          <View style={styles.skeletonList}>
            <SkeletonBox height={56} />
            <SkeletonBox height={56} />
            <SkeletonBox height={56} />
          </View>
        ) : listError ? (
          <ErrorState onRetry={onRefresh} />
        ) : showNoResults ? (
          <View style={styles.noResults}>
            <EmptyState
              headline={`No results for "${query.trim()}"`}
              body="Try a different spelling or browse categories."
              ctaLabel="Browse categories"
              onCtaPress={() => {
                setQuery('');
                clearCategory();
              }}
            />
            {(aiSearchQuery.data?.suggestions.length ?? 0) > 0 ? (
              <View style={styles.suggestions}>
                <Text style={styles.suggestionsTitle}>Did you mean?</Text>
                {aiSearchQuery.data?.suggestions.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    style={styles.suggestionChip}
                    onPress={() => setQuery(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <FlashList
            data={listData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductResultRow product={item} onPress={() => openProduct(item)} />
            )}
            refreshControl={
              <RefreshControl
                refreshing={
                  searchQuery.isRefetching || categoryProductsQuery.isRefetching
                }
                onRefresh={onRefresh}
                tintColor={colors.green.primary}
              />
            }
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isOffline ? <NetworkBanner /> : null}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        autoFocus={shouldFocus}
        placeholder={t('search.placeholder')}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={trendingQuery.isRefetching || categoriesQuery.isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.green.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader title="Trending today" />

        {trendingQuery.isLoading ? (
          <View style={styles.chipSkeleton}>
            <SkeletonBox height={36} width={100} />
            <SkeletonBox height={36} width={120} />
          </View>
        ) : trendingQuery.isError ? (
          <ErrorState onRetry={() => void trendingQuery.refetch()} />
        ) : (
          <ProductChipRow
            products={trendingQuery.data ?? []}
            onProductPress={openProduct}
          />
        )}

        <SectionHeader title="Browse by category" />

        {categoriesQuery.isLoading ? (
          <View style={styles.gridSkeleton}>
            <SkeletonBox height={88} width="47%" />
            <SkeletonBox height={88} width="47%" />
          </View>
        ) : (
          <CategoryGrid
            counts={categoryCounts}
            onCategoryPress={(category) => {
              setQuery('');
              setSelectedCategory(category);
            }}
          />
        )}
      </ScrollView>
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.sm,
  },
  categoryTitle: {
    ...typography.h2,
    color: colors.neutral[900],
  },
  clearLink: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  skeletonList: {
    padding: spacing.screenHorizontal,
    gap: spacing.sm,
  },
  noResults: {
    paddingHorizontal: spacing.screenHorizontal,
    gap: spacing.md,
  },
  suggestions: {
    gap: spacing.sm,
  },
  suggestionsTitle: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '700',
  },
  suggestionChip: {
    backgroundColor: colors.neutral[0],
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    ...typography.body,
    color: colors.green.primary,
    fontWeight: '600',
  },
  chipSkeleton: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenHorizontal,
  },
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.screenHorizontal,
  },
});
