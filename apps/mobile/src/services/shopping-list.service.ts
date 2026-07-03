import { apiRequest } from '../lib/api';
import { OptimiseResult, ShoppingListItem } from '../types/shopping-list';

export function fetchShoppingListItems(): Promise<ShoppingListItem[]> {
  return apiRequest<ShoppingListItem[]>('/list/items');
}

export function addShoppingListItem(payload: {
  productId: string;
  quantity?: number;
}): Promise<ShoppingListItem> {
  return apiRequest<ShoppingListItem>('/list/items', {
    method: 'POST',
    body: JSON.stringify({
      productId: payload.productId,
      quantity: payload.quantity ?? 1,
    }),
  });
}

export function deleteShoppingListItem(
  itemId: string,
): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(`/list/items/${itemId}`, {
    method: 'DELETE',
  });
}

export function optimiseShoppingList(): Promise<OptimiseResult> {
  return apiRequest<OptimiseResult>('/list/optimise', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
