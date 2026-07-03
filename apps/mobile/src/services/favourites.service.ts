import { apiRequest } from '../lib/api';
import { FavouriteItem } from '../types/favourites-alerts';

export function fetchFavourites(): Promise<FavouriteItem[]> {
  return apiRequest<FavouriteItem[]>('/favourites');
}

export function addFavourite(productId: string): Promise<FavouriteItem> {
  return apiRequest<FavouriteItem>('/favourites', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

export function removeFavourite(productId: string): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(`/favourites/${productId}`, {
    method: 'DELETE',
  });
}
