import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { queryKeys } from '../lib/query-keys';
import { searchProducts } from '../services/products.service';

const DEBOUNCE_MS = 300;

export function useProductSearch(query: string, minLength = 2) {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < minLength) {
      setDebouncedQuery('');
      return;
    }

    const timer = setTimeout(() => setDebouncedQuery(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, minLength]);

  return useQuery({
    queryKey: queryKeys.products.search(debouncedQuery),
    queryFn: () => searchProducts(debouncedQuery, 10),
    enabled: debouncedQuery.length >= minLength,
  });
}
