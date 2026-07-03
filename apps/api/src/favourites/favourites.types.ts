export interface FavouriteItem {
  id: string;
  productId: string;
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

export interface FavouriteRow {
  id: string;
  product_id: string;
  created_at: string;
  products:
    | {
        id: string;
        name: string;
        slug: string;
        category: string;
        default_unit: string;
        photo_url: string | null;
      }
    | Array<{
        id: string;
        name: string;
        slug: string;
        category: string;
        default_unit: string;
        photo_url: string | null;
      }>;
}
