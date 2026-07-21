-- LMI: Expand product categories for typical Lagos open markets

ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'tubers_roots';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'grains_cereals';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'legumes';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'swallow_staples';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'meat';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'poultry';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'seafood';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'dairy';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'spices_seasonings';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'oils_fats';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'beverages';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'provisions';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'bakery';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'frozen_foods';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'snacks';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'household';

-- Remap existing catalogue items into the new category set
UPDATE public.products
SET category = 'tubers_roots'
WHERE slug IN ('yam', 'cassava', 'sweet-potato');

UPDATE public.products
SET category = 'grains_cereals'
WHERE slug IN ('rice', 'maize', 'millet', 'sorghum', 'wheat-flour');

UPDATE public.products
SET category = 'swallow_staples'
WHERE slug IN ('garri', 'semovita');

UPDATE public.products
SET category = 'legumes'
WHERE slug = 'beans';

UPDATE public.products
SET category = 'meat'
WHERE slug IN ('beef', 'goat-meat');

UPDATE public.products
SET category = 'poultry'
WHERE slug IN ('chicken', 'turkey', 'eggs');

UPDATE public.products
SET category = 'seafood'
WHERE slug IN ('titus-fish', 'stockfish', 'catfish', 'shrimp');

UPDATE public.products
SET category = 'spices_seasonings'
WHERE category::text = 'spices';

UPDATE public.products
SET category = 'oils_fats'
WHERE category::text = 'oils';

-- Representative Lagos market staples for newly added categories
INSERT INTO public.products (name, slug, category, default_unit, allowed_units) VALUES
  ('Irish Potato', 'irish-potato', 'tubers_roots', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Plantain', 'plantain', 'fruits', 'bunch', ARRAY['bunch', 'piece']::public.price_unit[]),
  ('Groundnut', 'groundnut', 'legumes', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Amala Flour', 'amala-flour', 'swallow_staples', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Pork', 'pork', 'meat', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Crayfish', 'crayfish', 'seafood', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Periwinkle', 'periwinkle', 'seafood', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Peak Milk', 'peak-milk', 'dairy', 'piece', ARRAY['piece']::public.price_unit[]),
  ('Butter', 'butter', 'dairy', 'piece', ARRAY['piece']::public.price_unit[]),
  ('Palm Oil', 'palm-oil', 'oils_fats', 'litre', ARRAY['litre']::public.price_unit[]),
  ('Coca-Cola', 'coca-cola', 'beverages', 'piece', ARRAY['piece']::public.price_unit[]),
  ('Maltina', 'maltina', 'beverages', 'piece', ARRAY['piece']::public.price_unit[]),
  ('Sachet Water', 'sachet-water', 'beverages', 'bag', ARRAY['bag', 'piece']::public.price_unit[]),
  ('Indomie Noodles', 'indomie-noodles', 'provisions', 'piece', ARRAY['piece', 'bag']::public.price_unit[]),
  ('Sugar', 'sugar', 'provisions', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Salt', 'salt', 'provisions', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Tomato Paste', 'tomato-paste', 'provisions', 'piece', ARRAY['piece']::public.price_unit[]),
  ('Agege Bread', 'agege-bread', 'bakery', 'piece', ARRAY['piece']::public.price_unit[]),
  ('Frozen Chicken', 'frozen-chicken', 'frozen_foods', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Frozen Turkey', 'frozen-turkey', 'frozen_foods', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Gala', 'gala', 'snacks', 'piece', ARRAY['piece']::public.price_unit[]),
  ('Plantain Chips', 'plantain-chips', 'snacks', 'piece', ARRAY['piece', 'bag']::public.price_unit[]),
  ('Detergent', 'detergent', 'household', 'piece', ARRAY['piece']::public.price_unit[]),
  ('Bar Soap', 'bar-soap', 'household', 'piece', ARRAY['piece']::public.price_unit[])
ON CONFLICT (slug) DO NOTHING;
