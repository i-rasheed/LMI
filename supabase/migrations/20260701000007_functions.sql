-- LMI: Database functions

-- ---------------------------------------------------------------------------
-- Utility: updated_at trigger function
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Auth: create profile + defaults on signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, email, display_name)
  VALUES (
    NEW.id,
    NEW.phone,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      NEW.raw_user_meta_data ->> 'full_name',
      SPLIT_PART(COALESCE(NEW.email, NEW.phone, 'user'), '@', 1)
    )
  );

  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);
  INSERT INTO public.shopping_lists (user_id) VALUES (NEW.id);

  IF NEW.raw_user_meta_data ? 'role' THEN
    UPDATE public.profiles
    SET role = (NEW.raw_user_meta_data ->> 'role')::public.user_role
    WHERE id = NEW.id
      AND (NEW.raw_user_meta_data ->> 'role')::public.user_role != 'admin';
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Products: maintain full-text search vector
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.products_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(
      (SELECT string_agg(alias, ' ') FROM public.product_aliases WHERE product_id = NEW.id),
      ''
    )), 'B');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.product_aliases_search_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.products
  SET search_vector =
    setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(
      (SELECT string_agg(alias, ' ') FROM public.product_aliases WHERE product_id = products.id),
      ''
    )), 'B'),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ---------------------------------------------------------------------------
-- Badge level from accepted submission count
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_badge_level(p_count INTEGER)
RETURNS public.badge_level
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_count >= 500 THEN RETURN 'elite';
  ELSIF p_count >= 200 THEN RETURN 'gold';
  ELSIF p_count >= 50 THEN RETURN 'silver';
  ELSIF p_count >= 1 THEN RETURN 'bronze';
  END IF;
  RETURN NULL;
END;
$$;

-- ---------------------------------------------------------------------------
-- Reporter stats + badge promotion
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_reporter_stats(p_reporter_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_new_badge public.badge_level;
  v_current_badge public.badge_level;
  v_today DATE := (NOW() AT TIME ZONE 'Africa/Lagos')::DATE;
  v_week_start DATE := date_trunc('week', NOW() AT TIME ZONE 'Africa/Lagos')::DATE;
  v_last_date DATE;
  v_streak INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.price_submissions
  WHERE submitter_id = p_reporter_id
    AND source = 'reporter'
    AND status IN ('live', 'flagged', 'under_review');

  INSERT INTO public.reporter_stats (reporter_id, accepted_submission_count, week_start_date)
  VALUES (p_reporter_id, v_count, v_week_start)
  ON CONFLICT (reporter_id) DO UPDATE
  SET accepted_submission_count = v_count,
      week_start_date = CASE
        WHEN reporter_stats.week_start_date IS DISTINCT FROM v_week_start THEN v_week_start
        ELSE reporter_stats.week_start_date
      END,
      weekly_submission_count = CASE
        WHEN reporter_stats.week_start_date IS DISTINCT FROM v_week_start THEN 1
        ELSE reporter_stats.weekly_submission_count + 1
      END,
      updated_at = NOW();

  SELECT last_submission_date, current_streak_days
  INTO v_last_date, v_streak
  FROM public.reporter_stats
  WHERE reporter_id = p_reporter_id;

  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    v_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    v_streak := v_streak + 1;
  END IF;

  UPDATE public.reporter_stats
  SET last_submission_date = v_today,
      current_streak_days = v_streak,
      longest_streak_days = GREATEST(longest_streak_days, v_streak),
      updated_at = NOW()
  WHERE reporter_id = p_reporter_id;

  v_new_badge := public.calculate_badge_level(v_count);
  SELECT current_badge_level INTO v_current_badge FROM public.profiles WHERE id = p_reporter_id;

  IF v_new_badge IS NOT NULL AND (
    v_current_badge IS NULL OR
    (v_new_badge = 'silver' AND v_current_badge = 'bronze') OR
    (v_new_badge = 'gold' AND v_current_badge IN ('bronze', 'silver')) OR
    (v_new_badge = 'elite' AND v_current_badge IN ('bronze', 'silver', 'gold'))
  ) THEN
    UPDATE public.profiles SET current_badge_level = v_new_badge WHERE id = p_reporter_id;

    INSERT INTO public.reporter_badges (reporter_id, badge_level, submission_count_at_earn)
    VALUES (p_reporter_id, v_new_badge, v_count)
    ON CONFLICT (reporter_id, badge_level) DO NOTHING;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 7-day market average for outlier detection
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_market_7day_avg(
  p_product_id UUID,
  p_market_id UUID,
  p_unit public.price_unit
)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT AVG(price_naira)::NUMERIC
  FROM public.price_submissions
  WHERE product_id = p_product_id
    AND market_id = p_market_id
    AND unit = p_unit
    AND status IN ('live', 'flagged', 'under_review', 'removed')
    AND created_at >= NOW() - INTERVAL '7 days';
$$;

-- ---------------------------------------------------------------------------
-- Duplicate submission check (same reporter+product+market+unit within 30 min)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_duplicate_submission(
  p_submitter_id UUID,
  p_product_id UUID,
  p_market_id UUID,
  p_unit public.price_unit
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.price_submissions
    WHERE submitter_id = p_submitter_id
      AND product_id = p_product_id
      AND market_id = p_market_id
      AND unit = p_unit
      AND created_at >= NOW() - INTERVAL '30 minutes'
  );
$$;

-- ---------------------------------------------------------------------------
-- Outlier detection on new submission (BEFORE INSERT)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.detect_price_outlier()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg NUMERIC;
  v_deviation NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_avg := public.get_market_7day_avg(NEW.product_id, NEW.market_id, NEW.unit);

    IF v_avg IS NOT NULL AND v_avg > 0 THEN
      v_deviation := ABS(NEW.price_naira - v_avg) / v_avg;
      IF v_deviation > 0.5 THEN
        NEW.is_auto_flagged := TRUE;
        NEW.auto_flag_reason := 'Price deviates >50% from 7-day market average';
        NEW.status := 'under_review';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Sync current_prices from new submission (AFTER INSERT)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_current_price_from_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('live', 'flagged', 'under_review') THEN
    IF NEW.is_auto_flagged THEN
      INSERT INTO public.flag_reviews (submission_id, flag_count, escalated_at)
      VALUES (NEW.id, 0, NOW())
      ON CONFLICT (submission_id) DO NOTHING;
    END IF;

    INSERT INTO public.current_prices (
      product_id, market_id, unit, price_naira, submission_id,
      submitter_id, source, vendor_stall_id, photo_url, status,
      flag_count, submitted_at
    ) VALUES (
      NEW.product_id, NEW.market_id, NEW.unit, NEW.price_naira, NEW.id,
      NEW.submitter_id, NEW.source, NEW.vendor_stall_id, NEW.photo_url, NEW.status,
      NEW.flag_count, NEW.created_at
    )
    ON CONFLICT (product_id, market_id, unit) DO UPDATE
    SET price_naira = EXCLUDED.price_naira,
        submission_id = EXCLUDED.submission_id,
        submitter_id = EXCLUDED.submitter_id,
        source = EXCLUDED.source,
        vendor_stall_id = EXCLUDED.vendor_stall_id,
        photo_url = EXCLUDED.photo_url,
        status = EXCLUDED.status,
        flag_count = EXCLUDED.flag_count,
        submitted_at = EXCLUDED.submitted_at,
        updated_at = NOW();

    IF NEW.source = 'reporter' THEN
      PERFORM public.update_reporter_stats(NEW.submitter_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Update flag counts and escalate to admin queue at 3+ flags
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_price_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.price_submissions
  SET flag_count = flag_count + 1,
      status = CASE WHEN status = 'live' THEN 'flagged'::public.submission_status ELSE status END,
      updated_at = NOW()
  WHERE id = NEW.submission_id
  RETURNING flag_count INTO v_count;

  UPDATE public.current_prices
  SET flag_count = v_count,
      status = CASE WHEN status = 'live' THEN 'flagged'::public.submission_status ELSE status END,
      updated_at = NOW()
  WHERE submission_id = NEW.submission_id;

  IF v_count >= 3 THEN
    UPDATE public.price_submissions
    SET status = 'under_review', updated_at = NOW()
    WHERE id = NEW.submission_id;

    UPDATE public.current_prices
    SET status = 'under_review', updated_at = NOW()
    WHERE submission_id = NEW.submission_id;

    INSERT INTO public.flag_reviews (submission_id, flag_count, escalated_at)
    VALUES (NEW.submission_id, v_count, NOW())
    ON CONFLICT (submission_id) DO UPDATE
    SET flag_count = EXCLUDED.flag_count,
        escalated_at = NOW(),
        is_resolved = FALSE;
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Propagate submission status changes to current_prices
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_submission_status_to_current()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.price_naira IS DISTINCT FROM NEW.price_naira THEN
    UPDATE public.current_prices
    SET status = NEW.status,
        price_naira = NEW.price_naira,
        flag_count = NEW.flag_count,
        updated_at = NOW()
  WHERE submission_id = NEW.id;

    IF NEW.status = 'removed' AND NEW.source = 'reporter' THEN
      PERFORM public.update_reporter_stats(NEW.submitter_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Role helpers for RLS
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_account_status()
RETURNS public.account_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_status FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_active_premium(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND s.subscription_type = 'shopper_premium'
      AND s.status = 'active'
      AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  );
$$;

-- ---------------------------------------------------------------------------
-- Freemium limit checks (called from NestJS; available in DB for consistency)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_freemium_limit(
  p_user_id UUID,
  p_resource TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_premium BOOLEAN;
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  v_is_premium := public.has_active_premium(p_user_id);
  IF v_is_premium THEN RETURN TRUE; END IF;

  CASE p_resource
    WHEN 'favourites' THEN
      v_limit := 10;
      SELECT COUNT(*) INTO v_count FROM public.favourites WHERE user_id = p_user_id;
    WHEN 'alerts' THEN
      v_limit := 3;
      SELECT COUNT(*) INTO v_count FROM public.price_alerts WHERE user_id = p_user_id AND is_active = TRUE;
    WHEN 'list_items' THEN
      v_limit := 5;
      SELECT COUNT(*) INTO v_count
      FROM public.shopping_list_items sli
      JOIN public.shopping_lists sl ON sl.id = sli.list_id
      WHERE sl.user_id = p_user_id;
    ELSE
      RETURN TRUE;
  END CASE;

  RETURN v_count < v_limit;
END;
$$;

-- ---------------------------------------------------------------------------
-- Soft delete account scheduling
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.schedule_account_deletion(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET account_status = 'pending_deletion',
      deleted_at = NOW(),
      permanent_delete_at = NOW() + INTERVAL '7 days',
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_account_deletion(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET account_status = 'active',
      deleted_at = NULL,
      permanent_delete_at = NULL,
      updated_at = NOW()
  WHERE id = p_user_id AND account_status = 'pending_deletion';
END;
$$;

-- ---------------------------------------------------------------------------
-- Leaderboard reset (called by Render cron Monday 00:00 WAT)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reset_weekly_leaderboard()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start DATE := date_trunc('week', NOW() AT TIME ZONE 'Africa/Lagos')::DATE;
  v_week_end DATE := v_week_start + 6;
BEGIN
  INSERT INTO public.leaderboard_snapshots (reporter_id, period_start, period_end, submission_count, rank)
  SELECT
    reporter_id,
    v_week_start - 7,
    v_week_end - 7,
    weekly_submission_count,
    RANK() OVER (ORDER BY weekly_submission_count DESC)
  FROM public.reporter_stats
  WHERE weekly_submission_count > 0
  ON CONFLICT (reporter_id, period_start) DO NOTHING;

  UPDATE public.reporter_stats
  SET weekly_submission_count = 0,
      week_start_date = v_week_start,
      updated_at = NOW();
END;
$$;

-- ---------------------------------------------------------------------------
-- Haversine distance in km (for nearest market / optimiser)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.haversine_km(
  lat1 NUMERIC, lng1 NUMERIC,
  lat2 NUMERIC, lng2 NUMERIC
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 6371 * 2 * ASIN(SQRT(
    POWER(SIN(RADIANS(lat2 - lat1) / 2), 2) +
    COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
    POWER(SIN(RADIANS(lng2 - lng1) / 2), 2)
  ));
$$;
