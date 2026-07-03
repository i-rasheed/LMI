-- LMI: Catalogue functions + expanded Lagos seed data (15 markets, 50 products)

-- ---------------------------------------------------------------------------
-- Product search: FTS on search_vector with pg_trgm fallback
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.search_products(
  p_query TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  category public.product_category,
  default_unit public.price_unit,
  allowed_units public.price_unit[],
  photo_url TEXT,
  rank REAL
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_query TEXT := trim(COALESCE(p_query, ''));
  v_tsquery TSQUERY;
  v_limit INTEGER := GREATEST(1, LEAST(COALESCE(p_limit, 10), 50));
BEGIN
  IF v_query = '' THEN
    RETURN;
  END IF;

  v_tsquery := plainto_tsquery('english', v_query);

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.category,
    p.default_unit,
    p.allowed_units,
    p.photo_url,
    GREATEST(
      CASE
        WHEN p.search_vector @@ v_tsquery
          THEN ts_rank_cd(p.search_vector, v_tsquery)::REAL
        ELSE 0::REAL
      END,
      similarity(p.name, v_query)::REAL,
      COALESCE(
        (
          SELECT MAX(similarity(pa.alias, v_query))::REAL
          FROM public.product_aliases pa
          WHERE pa.product_id = p.id
        ),
        0::REAL
      )
    ) AS rank
  FROM public.products p
  WHERE p.is_active = TRUE
    AND (
      p.search_vector @@ v_tsquery
      OR p.name ILIKE '%' || v_query || '%'
      OR p.name % v_query
      OR EXISTS (
        SELECT 1
        FROM public.product_aliases pa
        WHERE pa.product_id = p.id
          AND (pa.alias ILIKE '%' || v_query || '%' OR pa.alias % v_query)
      )
    )
  ORDER BY rank DESC, p.name ASC
  LIMIT v_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_nearby_markets(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC DEFAULT 50,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  area TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  photo_url TEXT,
  categories TEXT[],
  distance_km NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    m.id,
    m.name,
    m.slug,
    m.area,
    m.latitude,
    m.longitude,
    m.photo_url,
    m.categories,
    public.haversine_km(p_lat, p_lng, m.latitude, m.longitude) AS distance_km
  FROM public.markets m
  WHERE m.is_active = TRUE
    AND public.haversine_km(p_lat, p_lng, m.latitude, m.longitude) <= GREATEST(COALESCE(p_radius_km, 50), 0.1)
  ORDER BY distance_km ASC, m.name ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 100));
$$;

CREATE OR REPLACE FUNCTION public.get_trending_products(
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  category public.product_category,
  default_unit public.price_unit,
  photo_url TEXT,
  search_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.name,
    p.slug,
    p.category,
    p.default_unit,
    p.photo_url,
    COUNT(rs.id) AS search_count
  FROM public.products p
  LEFT JOIN public.recent_searches rs
    ON rs.result_id = p.id
    AND rs.result_type = 'product'
    AND rs.searched_at >= NOW() - INTERVAL '7 days'
  WHERE p.is_active = TRUE
  GROUP BY p.id, p.name, p.slug, p.category, p.default_unit, p.photo_url
  ORDER BY search_count DESC, p.name ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 50));
$$;

GRANT EXECUTE ON FUNCTION public.search_products(TEXT, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_nearby_markets(NUMERIC, NUMERIC, NUMERIC, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_trending_products(INTEGER) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Additional Lagos markets (3 exist from initial seed → 15 total)
-- ---------------------------------------------------------------------------

INSERT INTO public.markets (name, slug, area, latitude, longitude, opening_hours, categories) VALUES
  ('Alaba International Market', 'alaba', 'Ojo', 6.4605, 3.1892,
    '{"mon":{"open":"07:00","close":"19:00"},"tue":{"open":"07:00","close":"19:00"},"wed":{"open":"07:00","close":"19:00"},"thu":{"open":"07:00","close":"19:00"},"fri":{"open":"07:00","close":"19:00"},"sat":{"open":"07:00","close":"19:00"},"sun":{"open":"08:00","close":"16:00"}}'::JSONB,
    ARRAY['grains', 'protein', 'oils']),
  ('Tejuosho Market', 'tejuosho', 'Surulere', 6.5034, 3.3521,
    '{"mon":{"open":"06:00","close":"20:00"},"tue":{"open":"06:00","close":"20:00"},"wed":{"open":"06:00","close":"20:00"},"thu":{"open":"06:00","close":"20:00"},"fri":{"open":"06:00","close":"20:00"},"sat":{"open":"06:00","close":"20:00"},"sun":{"open":"07:00","close":"17:00"}}'::JSONB,
    ARRAY['vegetables', 'protein', 'spices']),
  ('Trade Fair Complex', 'trade-fair', 'Ojo', 6.4658, 3.2134,
    '{"mon":{"open":"08:00","close":"18:00"},"tue":{"open":"08:00","close":"18:00"},"wed":{"open":"08:00","close":"18:00"},"thu":{"open":"08:00","close":"18:00"},"fri":{"open":"08:00","close":"18:00"},"sat":{"open":"08:00","close":"18:00"},"sun":{"open":"09:00","close":"15:00"}}'::JSONB,
    ARRAY['grains', 'oils', 'other']),
  ('Idumota Market', 'idumota', 'Lagos Island', 6.4589, 3.3898,
    '{"mon":{"open":"07:00","close":"19:00"},"tue":{"open":"07:00","close":"19:00"},"wed":{"open":"07:00","close":"19:00"},"thu":{"open":"07:00","close":"19:00"},"fri":{"open":"07:00","close":"19:00"},"sat":{"open":"07:00","close":"19:00"},"sun":{"open":"08:00","close":"16:00"}}'::JSONB,
    ARRAY['spices', 'oils', 'grains']),
  ('Mushin Market', 'mushin', 'Mushin', 6.5281, 3.3541,
    '{"mon":{"open":"06:00","close":"20:00"},"tue":{"open":"06:00","close":"20:00"},"wed":{"open":"06:00","close":"20:00"},"thu":{"open":"06:00","close":"20:00"},"fri":{"open":"06:00","close":"20:00"},"sat":{"open":"06:00","close":"20:00"},"sun":{"open":"07:00","close":"17:00"}}'::JSONB,
    ARRAY['vegetables', 'fruits', 'protein']),
  ('Agege Market', 'agege', 'Agege', 6.6219, 3.3250,
    '{"mon":{"open":"06:00","close":"20:00"},"tue":{"open":"06:00","close":"20:00"},"wed":{"open":"06:00","close":"20:00"},"thu":{"open":"06:00","close":"20:00"},"fri":{"open":"06:00","close":"20:00"},"sat":{"open":"06:00","close":"20:00"},"sun":{"open":"07:00","close":"17:00"}}'::JSONB,
    ARRAY['vegetables', 'grains', 'fruits']),
  ('Ketu Market', 'ketu', 'Kosofe', 6.5908, 3.3899,
    '{"mon":{"open":"06:00","close":"20:00"},"tue":{"open":"06:00","close":"20:00"},"wed":{"open":"06:00","close":"20:00"},"thu":{"open":"06:00","close":"20:00"},"fri":{"open":"06:00","close":"20:00"},"sat":{"open":"06:00","close":"20:00"},"sun":{"open":"07:00","close":"17:00"}}'::JSONB,
    ARRAY['vegetables', 'protein', 'spices']),
  ('Oshodi Market', 'oshodi', 'Oshodi-Isolo', 6.5568, 3.3434,
    '{"mon":{"open":"06:00","close":"21:00"},"tue":{"open":"06:00","close":"21:00"},"wed":{"open":"06:00","close":"21:00"},"thu":{"open":"06:00","close":"21:00"},"fri":{"open":"06:00","close":"21:00"},"sat":{"open":"06:00","close":"21:00"},"sun":{"open":"07:00","close":"18:00"}}'::JSONB,
    ARRAY['vegetables', 'fruits', 'grains']),
  ('Sandgrouse Market', 'sandgrouse', 'Lagos Island', 6.4489, 3.4021,
    '{"mon":{"open":"06:00","close":"19:00"},"tue":{"open":"06:00","close":"19:00"},"wed":{"open":"06:00","close":"19:00"},"thu":{"open":"06:00","close":"19:00"},"fri":{"open":"06:00","close":"19:00"},"sat":{"open":"06:00","close":"19:00"},"sun":{"open":"07:00","close":"16:00"}}'::JSONB,
    ARRAY['protein', 'spices', 'vegetables']),
  ('Epe Fish Market', 'epe-fish', 'Epe', 6.5842, 3.9832,
    '{"mon":{"open":"05:00","close":"18:00"},"tue":{"open":"05:00","close":"18:00"},"wed":{"open":"05:00","close":"18:00"},"thu":{"open":"05:00","close":"18:00"},"fri":{"open":"05:00","close":"18:00"},"sat":{"open":"05:00","close":"18:00"},"sun":{"open":"06:00","close":"16:00"}}'::JSONB,
    -- fish market
    ARRAY['protein']),
  ('Yaba Market', 'yaba', 'Yaba', 6.5095, 3.3711,
    '{"mon":{"open":"07:00","close":"20:00"},"tue":{"open":"07:00","close":"20:00"},"wed":{"open":"07:00","close":"20:00"},"thu":{"open":"07:00","close":"20:00"},"fri":{"open":"07:00","close":"20:00"},"sat":{"open":"07:00","close":"20:00"},"sun":{"open":"08:00","close":"17:00"}}'::JSONB,
    ARRAY['vegetables', 'fruits', 'grains']),
  ('Iddo Railway Market', 'iddo-railway', 'Mainland', 6.4745, 3.3798,
    '{"mon":{"open":"06:00","close":"20:00"},"tue":{"open":"06:00","close":"20:00"},"wed":{"open":"06:00","close":"20:00"},"thu":{"open":"06:00","close":"20:00"},"fri":{"open":"06:00","close":"20:00"},"sat":{"open":"06:00","close":"20:00"},"sun":{"open":"07:00","close":"17:00"}}'::JSONB,
    ARRAY['vegetables', 'grains', 'protein'])
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Additional products (6 exist from initial seed → 50 total)
-- ---------------------------------------------------------------------------

INSERT INTO public.products (name, slug, category, default_unit, allowed_units) VALUES
  ('Onions', 'onions', 'vegetables', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Spinach', 'spinach', 'vegetables', 'bunch', ARRAY['bunch']::public.price_unit[]),
  ('Ugu', 'ugu', 'vegetables', 'bunch', ARRAY['bunch']::public.price_unit[]),
  ('Water Leaf', 'water-leaf', 'vegetables', 'bunch', ARRAY['bunch']::public.price_unit[]),
  ('Carrots', 'carrots', 'vegetables', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Cabbage', 'cabbage', 'vegetables', 'piece', ARRAY['piece', 'kg']::public.price_unit[]),
  ('Cucumber', 'cucumber', 'vegetables', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Bell Pepper', 'bell-pepper', 'vegetables', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Garden Egg', 'garden-egg', 'vegetables', 'kg', ARRAY['kg', 'bunch']::public.price_unit[]),
  ('Okra', 'okra', 'vegetables', 'kg', ARRAY['kg', 'bunch']::public.price_unit[]),
  ('Beans', 'beans', 'grains', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Maize', 'maize', 'grains', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Garri', 'garri', 'grains', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Semovita', 'semovita', 'grains', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Wheat Flour', 'wheat-flour', 'grains', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Millet', 'millet', 'grains', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Sorghum', 'sorghum', 'grains', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Yam', 'yam', 'grains', 'piece', ARRAY['piece', 'kg']::public.price_unit[]),
  ('Beef', 'beef', 'protein', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Goat Meat', 'goat-meat', 'protein', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Titus Fish', 'titus-fish', 'protein', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Stockfish', 'stockfish', 'protein', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Eggs', 'eggs', 'protein', 'crate', ARRAY['crate', 'piece']::public.price_unit[]),
  ('Turkey', 'turkey', 'protein', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Catfish', 'catfish', 'protein', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Shrimp', 'shrimp', 'protein', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Ginger', 'ginger', 'spices', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Garlic', 'garlic', 'spices', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Curry Powder', 'curry-powder', 'spices', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Locust Beans', 'locust-beans', 'spices', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Nutmeg', 'nutmeg', 'spices', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Vegetable Oil', 'vegetable-oil', 'oils', 'litre', ARRAY['litre']::public.price_unit[]),
  ('Groundnut Oil', 'groundnut-oil', 'oils', 'litre', ARRAY['litre']::public.price_unit[]),
  ('Coconut Oil', 'coconut-oil', 'oils', 'litre', ARRAY['litre']::public.price_unit[]),
  ('Orange', 'orange', 'fruits', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Pineapple', 'pineapple', 'fruits', 'piece', ARRAY['piece']::public.price_unit[]),
  ('Watermelon', 'watermelon', 'fruits', 'piece', ARRAY['piece', 'kg']::public.price_unit[]),
  ('Banana', 'banana', 'fruits', 'bunch', ARRAY['bunch', 'piece']::public.price_unit[]),
  ('Mango', 'mango', 'fruits', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Avocado', 'avocado', 'fruits', 'piece', ARRAY['piece', 'kg']::public.price_unit[]),
  ('Pawpaw', 'pawpaw', 'fruits', 'piece', ARRAY['piece', 'kg']::public.price_unit[]),
  ('Apple', 'apple', 'fruits', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Sweet Potato', 'sweet-potato', 'vegetables', 'kg', ARRAY['kg']::public.price_unit[]),
  ('Cassava', 'cassava', 'grains', 'kg', ARRAY['kg']::public.price_unit[])
ON CONFLICT (slug) DO NOTHING;

-- Aliases for new products (+ existing slugs for completeness)
INSERT INTO public.product_aliases (product_id, alias)
SELECT p.id, a.alias
FROM public.products p
CROSS JOIN LATERAL (VALUES
  ('onions', 'onion'),
  ('onions', 'alubosa'),
  ('spinach', 'efo'),
  ('ugu', 'fluted pumpkin'),
  ('ugu', 'ugwu'),
  ('water-leaf', 'gbure'),
  ('carrots', 'carrot'),
  ('cabbage', 'lettuce cabbage'),
  ('cucumber', 'cucumbers'),
  ('bell-pepper', 'tatashe'),
  ('bell-pepper', 'sweet pepper'),
  ('garden-egg', 'aubergine'),
  ('garden-egg', 'eggplant'),
  ('okra', 'okro'),
  ('beans', 'ewa'),
  ('beans', 'black-eyed beans'),
  ('maize', 'corn'),
  ('garri', 'gari'),
  ('garri', 'eba flour'),
  ('semovita', 'semolina'),
  ('wheat-flour', 'flour'),
  ('millet', 'joro'),
  ('sorghum', 'guinea corn'),
  ('yam', 'igname'),
  ('yam', 'puna yam'),
  ('beef', 'cow meat'),
  ('goat-meat', 'goat'),
  ('titus-fish', 'mackerel'),
  ('titus-fish', 'titus'),
  ('stockfish', 'okporoko'),
  ('stockfish', 'panla'),
  ('eggs', 'egg'),
  ('eggs', 'crate of eggs'),
  ('turkey', 'turkey meat'),
  ('catfish', 'point and kill'),
  ('shrimp', 'prawns'),
  ('ginger', 'ata ile'),
  ('garlic', 'ayu'),
  ('curry-powder', 'curry'),
  ('locust-beans', 'iru'),
  ('locust-beans', 'ogiri'),
  ('nutmeg', 'ehuru'),
  ('vegetable-oil', 'veg oil'),
  ('groundnut-oil', 'peanut oil'),
  ('coconut-oil', 'coconut oil'),
  ('orange', 'oranges'),
  ('pineapple', 'pineapples'),
  ('watermelon', 'melons'),
  ('banana', 'bananas'),
  ('mango', 'mangoes'),
  ('avocado', 'pear'),
  ('pawpaw', 'papaya'),
  ('apple', 'apples'),
  ('sweet-potato', 'potato'),
  ('cassava', 'garri root'),
  ('tomatoes', 'tomatoe'),
  ('tomatoes', 'tomato'),
  ('rice', 'ofada rice'),
  ('rice', 'basmati'),
  ('scotch-bonnet-pepper', 'rodo'),
  ('palm-oil', 'palm oil'),
  ('chicken', 'live chicken'),
  ('plantain', 'ripe plantain')
) AS a(slug, alias)
WHERE p.slug = a.slug
ON CONFLICT DO NOTHING;

-- Refresh search vectors after bulk alias insert
UPDATE public.products p
SET search_vector =
  setweight(to_tsvector('english', COALESCE(p.name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(
    (SELECT string_agg(pa.alias, ' ') FROM public.product_aliases pa WHERE pa.product_id = p.id),
    ''
  )), 'B'),
  updated_at = NOW()
WHERE p.is_active = TRUE;
