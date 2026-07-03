import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import {
  fetchProductCategories,
  fetchProductsByCategory,
  fetchTrendingProducts,
} from '../services/products.service';
import { ProductCategory } from '../types/catalogue';

export function useTrending() {
  return useQuery({
    queryKey: queryKeys.products.trending,
    queryFn: () => fetchTrendingProducts(10),
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: fetchProductCategories,
  });
}

export function useProductsByCategory(category: ProductCategory | null) {
  return useQuery({
    queryKey: queryKeys.products.byCategory(category ?? ''),
    queryFn: () => fetchProductsByCategory(category!),
    enabled: category != null,
  });
}
