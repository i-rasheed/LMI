-- LMI: Sample current prices for dev/testing (Tomatoes across 3+ markets)
-- Requires at least one profile row (register a user first, or re-run after signup).

DO $$
DECLARE
  v_submitter UUID;
  v_product UUID;
  v_market UUID;
  v_submission UUID;
  v_prices RECORD;
BEGIN
  SELECT id INTO v_submitter FROM public.profiles ORDER BY created_at LIMIT 1;
  SELECT id INTO v_product FROM public.products WHERE slug = 'tomatoes' LIMIT 1;

  IF v_submitter IS NULL OR v_product IS NULL THEN
    RAISE NOTICE 'Skipping sample prices seed: need at least one profile and tomatoes product';
    RETURN;
  END IF;

  FOR v_prices IN
    SELECT * FROM (VALUES
      ('mile-12', 850, 'kg', NOW() - INTERVAL '3 hours'),
      ('balogun', 920, 'kg', NOW() - INTERVAL '30 hours'),
      ('oyingbo', 780, 'kg', NOW() - INTERVAL '80 hours'),
      ('ketu', 810, 'kg', NOW() - INTERVAL '12 hours'),
      ('mushin', 890, 'kg', NOW() - INTERVAL '5 hours')
    ) AS t(market_slug, price_naira, unit, submitted_at)
  LOOP
    SELECT id INTO v_market FROM public.markets WHERE slug = v_prices.market_slug LIMIT 1;
    IF v_market IS NULL THEN
      CONTINUE;
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.current_prices
      WHERE product_id = v_product AND market_id = v_market AND unit = v_prices.unit::public.price_unit
    ) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.price_submissions (
      product_id,
      market_id,
      submitter_id,
      source,
      price_naira,
      unit,
      status,
      created_at,
      updated_at
    ) VALUES (
      v_product,
      v_market,
      v_submitter,
      'reporter',
      v_prices.price_naira,
      v_prices.unit::public.price_unit,
      'live',
      v_prices.submitted_at,
      v_prices.submitted_at
    )
    RETURNING id INTO v_submission;

    -- Trigger sync_current_price_from_submission handles current_prices upsert
    NULL;
  END LOOP;
END $$;
