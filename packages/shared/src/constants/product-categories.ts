import { z } from 'zod';

/** Active catalogue categories for a typical Lagos open market. */
export const PRODUCT_CATEGORY_VALUES = [
  'vegetables',
  'fruits',
  'tubers_roots',
  'grains_cereals',
  'legumes',
  'swallow_staples',
  'meat',
  'poultry',
  'seafood',
  'dairy',
  'spices_seasonings',
  'oils_fats',
  'beverages',
  'provisions',
  'bakery',
  'frozen_foods',
  'snacks',
  'household',
  'other',
] as const;

export const productCategorySchema = z.enum(PRODUCT_CATEGORY_VALUES);

export type ProductCategory = z.infer<typeof productCategorySchema>;

export interface ProductCategoryMeta {
  value: ProductCategory;
  label: string;
  icon: string;
}

export const PRODUCT_CATEGORIES: ProductCategoryMeta[] = [
  { value: 'vegetables', label: 'Vegetables', icon: '🥬' },
  { value: 'fruits', label: 'Fruits', icon: '🍊' },
  { value: 'tubers_roots', label: 'Tubers & roots', icon: '🍠' },
  { value: 'grains_cereals', label: 'Grains & cereals', icon: '🌾' },
  { value: 'legumes', label: 'Beans & legumes', icon: '🫘' },
  { value: 'swallow_staples', label: 'Swallow & flour', icon: '🥣' },
  { value: 'meat', label: 'Meat', icon: '🥩' },
  { value: 'poultry', label: 'Poultry & eggs', icon: '🍗' },
  { value: 'seafood', label: 'Fish & seafood', icon: '🐟' },
  { value: 'dairy', label: 'Dairy', icon: '🥛' },
  { value: 'spices_seasonings', label: 'Spices & seasonings', icon: '🌶️' },
  { value: 'oils_fats', label: 'Oils & fats', icon: '🫒' },
  { value: 'beverages', label: 'Drinks', icon: '🥤' },
  { value: 'provisions', label: 'Provisions', icon: '🛒' },
  { value: 'bakery', label: 'Bread & bakery', icon: '🍞' },
  { value: 'frozen_foods', label: 'Frozen foods', icon: '🧊' },
  { value: 'snacks', label: 'Snacks', icon: '🍪' },
  { value: 'household', label: 'Household', icon: '🧴' },
  { value: 'other', label: 'Other', icon: '📦' },
];

const LABELS = Object.fromEntries(
  PRODUCT_CATEGORIES.map((category) => [category.value, category.label]),
) as Record<ProductCategory, string>;

export function getProductCategoryLabel(category: string): string {
  return LABELS[category as ProductCategory] ?? formatLegacyCategory(category);
}

function formatLegacyCategory(category: string): string {
  return category
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
