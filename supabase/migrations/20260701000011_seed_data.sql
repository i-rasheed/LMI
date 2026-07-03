-- LMI: Reference seed data

INSERT INTO public.subscription_plans (plan_type, name, amount_kobo, billing_interval) VALUES
  ('shopper_premium', 'LMI Premium Monthly', 150000, 'monthly'),
  ('shopper_premium', 'LMI Premium Annual', 1200000, 'annual'),
  ('vendor_basic', 'Vendor Basic', 500000, 'monthly'),
  ('vendor_pro', 'Vendor Pro', 1200000, 'monthly')
ON CONFLICT (plan_type, billing_interval) DO NOTHING;

-- Sample Lagos markets (expand via admin catalogue or separate seed script)
INSERT INTO public.markets (name, slug, area, latitude, longitude, opening_hours, categories) VALUES
  ('Mile 12 Market', 'mile-12', 'Kosofe', 6.5398, 3.3922,
    '{"mon":{"open":"05:00","close":"20:00"},"tue":{"open":"05:00","close":"20:00"},"wed":{"open":"05:00","close":"20:00"},"thu":{"open":"05:00","close":"20:00"},"fri":{"open":"05:00","close":"20:00"},"sat":{"open":"05:00","close":"20:00"},"sun":{"open":"06:00","close":"18:00"}}'::JSONB,
    ARRAY['vegetables', 'grains', 'protein']),
  ('Balogun Market', 'balogun', 'Lagos Island', 6.4541, 3.3947,
    '{"mon":{"open":"07:00","close":"19:00"},"tue":{"open":"07:00","close":"19:00"},"wed":{"open":"07:00","close":"19:00"},"thu":{"open":"07:00","close":"19:00"},"fri":{"open":"07:00","close":"19:00"},"sat":{"open":"07:00","close":"19:00"},"sun":{"open":"08:00","close":"16:00"}}'::JSONB,
    ARRAY['vegetables', 'spices', 'fruits']),
  ('Oyingbo Market', 'oyingbo', 'Mainland', 6.4924, 3.3676,
    '{"mon":{"open":"06:00","close":"20:00"},"tue":{"open":"06:00","close":"20:00"},"wed":{"open":"06:00","close":"20:00"},"thu":{"open":"06:00","close":"20:00"},"fri":{"open":"06:00","close":"20:00"},"sat":{"open":"06:00","close":"20:00"},"sun":{"open":"07:00","close":"17:00"}}'::JSONB,
    ARRAY['vegetables', 'protein', 'oils'])
ON CONFLICT (slug) DO NOTHING;

-- Sample products
INSERT INTO public.products (name, slug, category, default_unit, allowed_units) VALUES
  ('Tomatoes', 'tomatoes', 'vegetables', 'kg', ARRAY['kg', 'crate']::public.price_unit[]),
  ('Rice', 'rice', 'grains', 'kg', ARRAY['kg', 'bag']::public.price_unit[]),
  ('Scotch Bonnet Pepper', 'scotch-bonnet-pepper', 'vegetables', 'kg', ARRAY['kg', 'bunch']::public.price_unit[]),
  ('Palm Oil', 'palm-oil', 'oils', 'litre', ARRAY['litre']::public.price_unit[]),
  ('Chicken', 'chicken', 'protein', 'kg', ARRAY['kg', 'piece']::public.price_unit[]),
  ('Plantain', 'plantain', 'fruits', 'bunch', ARRAY['bunch', 'piece']::public.price_unit[])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_aliases (product_id, alias)
SELECT p.id, a.alias
FROM public.products p
CROSS JOIN LATERAL (VALUES
  ('tomatoes', 'tomato'),
  ('tomatoes', 'tomatoe'),
  ('tomatoes', 'fresh tomatoes'),
  ('rice', 'local rice'),
  ('rice', 'foreign rice'),
  ('scotch-bonnet-pepper', 'atarodo'),
  ('scotch-bonnet-pepper', 'pepper'),
  ('palm-oil', 'red oil'),
  ('chicken', 'broiler'),
  ('plantain', 'unripe plantain')
) AS a(slug, alias)
WHERE p.slug = a.slug
ON CONFLICT DO NOTHING;

-- Enable Realtime for admin flag queue (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.flag_reviews;
