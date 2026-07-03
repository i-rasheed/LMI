export interface ShoppingListItem {
  id: string;
  productId: string;
  quantity: number;
  sortOrder: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
    defaultUnit: string;
    photoUrl: string | null;
  };
}

export interface ShoppingListItemRow {
  id: string;
  product_id: string;
  quantity: number;
  sort_order: number;
  created_at: string;
  products: ProductJoinRow | ProductJoinRow[];
}

export interface ProductJoinRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  default_unit: string;
  photo_url: string | null;
}

export interface OptimiseResult {
  bestMarket: OptimisedMarket | null;
  markets: OptimisedMarket[];
  itemCount: number;
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

export interface CurrentPriceJoinRow {
  product_id: string;
  market_id: string;
  price_naira: number;
  unit: string;
  markets:
    | {
        id: string;
        name: string;
        area: string;
      }
    | Array<{
        id: string;
        name: string;
        area: string;
      }>;
}
