-- LMI: Row Level Security policies
-- Architecture: mobile reads/writes business data via NestJS (service-role).
-- RLS provides defense-in-depth; authenticated client access is intentionally narrow.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporter_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporter_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flag_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_search_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_select_public ON public.profiles
  FOR SELECT TO authenticated
  USING (
    account_status = 'active'
    AND role IN ('reporter', 'vendor')
  );

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() AND account_status IN ('active', 'pending_deletion'))
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Public catalogue (read-only for authenticated users)
-- ---------------------------------------------------------------------------

CREATE POLICY markets_select_active ON public.markets
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY products_select_active ON public.products
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY product_aliases_select ON public.product_aliases
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY subscription_plans_select ON public.subscription_plans
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- ---------------------------------------------------------------------------
-- Prices (read live data; writes via NestJS service-role)
-- ---------------------------------------------------------------------------

CREATE POLICY current_prices_select_visible ON public.current_prices
  FOR SELECT TO authenticated
  USING (status IN ('live', 'flagged', 'under_review'));

CREATE POLICY price_submissions_select_visible ON public.price_submissions
  FOR SELECT TO authenticated
  USING (status IN ('live', 'flagged', 'under_review'));

-- ---------------------------------------------------------------------------
-- Reporter public data
-- ---------------------------------------------------------------------------

CREATE POLICY reporter_stats_select ON public.reporter_stats
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY reporter_badges_select ON public.reporter_badges
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY leaderboard_select ON public.leaderboard_snapshots
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY product_trends_select ON public.product_search_trends
  FOR SELECT TO authenticated
  USING (TRUE);

-- ---------------------------------------------------------------------------
-- User-owned data
-- ---------------------------------------------------------------------------

CREATE POLICY favourites_all_own ON public.favourites
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.is_active_user());

CREATE POLICY price_alerts_all_own ON public.price_alerts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.is_active_user());

CREATE POLICY shopping_lists_select_own ON public.shopping_lists
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY shopping_list_items_all_own ON public.shopping_list_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = list_id AND sl.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = list_id AND sl.user_id = auth.uid()
    ) AND public.is_active_user()
  );

CREATE POLICY recent_searches_all_own ON public.recent_searches
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_prefs_own ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY push_devices_all_own ON public.push_devices
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND public.is_active_user());

CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY account_warnings_select_own ON public.account_warnings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY account_warnings_ack_own ON public.account_warnings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Price flags (shoppers can flag; not their own submissions)
-- ---------------------------------------------------------------------------

CREATE POLICY price_flags_insert ON public.price_flags
  FOR INSERT TO authenticated
  WITH CHECK (
    flagger_id = auth.uid()
    AND public.is_active_user()
    AND NOT EXISTS (
      SELECT 1 FROM public.price_submissions ps
      WHERE ps.id = submission_id AND ps.submitter_id = auth.uid()
    )
  );

CREATE POLICY price_flags_select_own ON public.price_flags
  FOR SELECT TO authenticated
  USING (flagger_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Vendor stalls (public read for approved; owner read/write pending)
-- ---------------------------------------------------------------------------

CREATE POLICY vendor_stalls_select_approved ON public.vendor_stalls
  FOR SELECT TO authenticated
  USING (claim_status = 'approved' OR owner_id = auth.uid());

CREATE POLICY vendor_stalls_insert_own ON public.vendor_stalls
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND public.get_my_role() = 'vendor'
    AND public.is_active_user()
  );

CREATE POLICY vendor_stalls_update_own_pending ON public.vendor_stalls
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() AND claim_status IN ('pending', 'rejected'))
  WITH CHECK (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Subscriptions (read own)
-- ---------------------------------------------------------------------------

CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY payment_transactions_select_own ON public.payment_transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Admin-only tables (no direct client access; service-role via NestJS)
-- ---------------------------------------------------------------------------

CREATE POLICY flag_reviews_admin_only ON public.flag_reviews
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY admin_actions_admin_only ON public.admin_actions
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY broadcast_admin_only ON public.broadcast_campaigns
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY app_config_read ON public.app_config
  FOR SELECT TO authenticated
  USING (key IN ('min_app_version', 'maintenance_mode'));

-- ---------------------------------------------------------------------------
-- Service role bypasses all RLS (used by NestJS API)
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Authenticated: read catalogue + own data
GRANT SELECT ON public.markets, public.products, public.product_aliases,
  public.current_prices, public.price_submissions, public.reporter_stats,
  public.reporter_badges, public.leaderboard_snapshots, public.product_search_trends,
  public.subscription_plans, public.vendor_stalls TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.favourites, public.price_alerts,
  public.shopping_list_items, public.recent_searches, public.notification_preferences,
  public.push_devices, public.price_flags TO authenticated;

GRANT SELECT, UPDATE ON public.profiles, public.notifications, public.account_warnings TO authenticated;
GRANT SELECT ON public.shopping_lists, public.subscriptions, public.payment_transactions TO authenticated;
GRANT INSERT, UPDATE ON public.vendor_stalls TO authenticated;

-- Sequences for serial/uuid defaults
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
