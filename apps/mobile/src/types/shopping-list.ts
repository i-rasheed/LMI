export interface ShoppingListProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  defaultUnit: string;
  photoUrl: string | null;
}

export interface ShoppingListItem {
  id: string;
  productId: string;
  quantity: number;
  sortOrder: number;
  createdAt: string;
  product: ShoppingListProduct;
}

export interface OptimisedMarket {
  marketId: string;
  marketName: string;
  marketArea: string;
  totalCostNaira: number;
  coverageCount: number;
  itemCount: number;
  breakdown: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    priceNaira: number | null;
    lineTotalNaira: number | null;
  }>;
}

export interface OptimiseResult {
  bestMarket: OptimisedMarket | null;
  markets: OptimisedMarket[];
  itemCount: number;
}
