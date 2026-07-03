import { apiRequest } from '../lib/api';
import {
  ProductCategory,
  ProductCategorySummary,
  ProductListItem,
  TrendingProduct,
} from '../types/catalogue';

export function searchProducts(
  q: string,
  limit = 10,
): Promise<ProductListItem[]> {
  const search = new URLSearchParams({ q });
  if (limit) {
    search.set('limit', String(limit));
  }
  return apiRequest<ProductListItem[]>(`/products/search?${search.toString()}`);
}

export function fetchTrendingProducts(limit = 10): Promise<TrendingProduct[]> {
  const search = new URLSearchParams();
  if (limit) {
    search.set('limit', String(limit));
  }
  const query = search.toString();
  return apiRequest<TrendingProduct[]>(
    `/products/trending${query ? `?${query}` : ''}`,
  );
}

export function fetchProductCategories(): Promise<ProductCategorySummary[]> {
  return apiRequest<ProductCategorySummary[]>('/products/categories');
}

export function fetchProductsByCategory(
  category: ProductCategory,
  limit = 50,
): Promise<ProductListItem[]> {
  const search = new URLSearchParams({ category, limit: String(limit) });
  return apiRequest<ProductListItem[]>(`/products?${search.toString()}`);
}

export function fetchProductById(id: string): Promise<ProductListItem> {
  return apiRequest<ProductListItem>(`/products/${id}`);
}
