-- LMI: Indexes for query performance

-- Profiles
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_account_status ON public.profiles (account_status);
CREATE INDEX idx_profiles_phone ON public.profiles (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_profiles_email ON public.profiles (email) WHERE email IS NOT NULL;

-- Markets
CREATE INDEX idx_markets_area ON public.markets (area);
CREATE INDEX idx_markets_active ON public.markets (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_markets_geo ON public.markets (latitude, longitude);
CREATE INDEX idx_markets_name_trgm ON public.markets USING gin (name gin_trgm_ops);

-- Products
CREATE INDEX idx_products_category ON public.products (category);
CREATE INDEX idx_products_active ON public.products (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_search_vector ON public.products USING gin (search_vector);
CREATE INDEX idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);

-- Product aliases
CREATE INDEX idx_product_aliases_alias_trgm ON public.product_aliases USING gin (alias gin_trgm_ops);
CREATE INDEX idx_product_aliases_product ON public.product_aliases (product_id);

-- Price submissions (history queries, charts)
CREATE INDEX idx_price_submissions_product_market ON public.price_submissions (product_id, market_id);
CREATE INDEX idx_price_submissions_submitter ON public.price_submissions (submitter_id, created_at DESC);
CREATE INDEX idx_price_submissions_market_created ON public.price_submissions (market_id, created_at DESC);
CREATE INDEX idx_price_submissions_product_created ON public.price_submissions (product_id, created_at DESC);
CREATE INDEX idx_price_submissions_status ON public.price_submissions (status) WHERE status = 'live';
CREATE INDEX idx_price_submissions_duplicate_check ON public.price_submissions (
  submitter_id, product_id, market_id, unit, created_at DESC
);

-- Current prices (comparison screen — primary hot path)
CREATE INDEX idx_current_prices_product ON public.current_prices (product_id, price_naira ASC);
CREATE INDEX idx_current_prices_market ON public.current_prices (market_id);
CREATE INDEX idx_current_prices_submitted_at ON public.current_prices (submitted_at DESC);
CREATE INDEX idx_current_prices_status ON public.current_prices (status) WHERE status IN ('live', 'flagged', 'under_review');
CREATE INDEX idx_current_prices_submitter ON public.current_prices (submitter_id);

-- Price flags
CREATE INDEX idx_price_flags_submission ON public.price_flags (submission_id);
CREATE INDEX idx_price_flags_pending ON public.price_flags (resolution) WHERE resolution = 'pending';

-- Flag reviews (admin queue)
CREATE INDEX idx_flag_reviews_unresolved ON public.flag_reviews (escalated_at ASC) WHERE is_resolved = FALSE;

-- Favourites & alerts
CREATE INDEX idx_favourites_user ON public.favourites (user_id);
CREATE INDEX idx_price_alerts_user_active ON public.price_alerts (user_id) WHERE is_active = TRUE;
CREATE INDEX idx_price_alerts_product ON public.price_alerts (product_id) WHERE is_active = TRUE;

-- Shopping lists
CREATE INDEX idx_shopping_list_items_list ON public.shopping_list_items (list_id, sort_order);

-- Recent searches
CREATE INDEX idx_recent_searches_user_time ON public.recent_searches (user_id, searched_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, created_at DESC)
  WHERE read_at IS NULL;
CREATE INDEX idx_notifications_user_inbox ON public.notifications (user_id, created_at DESC);

-- Push devices
CREATE INDEX idx_push_devices_user_active ON public.push_devices (user_id) WHERE is_active = TRUE;

-- Vendor
CREATE INDEX idx_vendor_stalls_market ON public.vendor_stalls (market_id);
CREATE INDEX idx_vendor_stalls_claim_status ON public.vendor_stalls (claim_status);
CREATE INDEX idx_vendor_stalls_owner ON public.vendor_stalls (owner_id);
CREATE INDEX idx_vendor_analytics_stall_time ON public.vendor_analytics_events (vendor_stall_id, created_at DESC);
CREATE INDEX idx_vendor_analytics_stall_type ON public.vendor_analytics_events (vendor_stall_id, event_type, created_at DESC);

-- Subscriptions
CREATE INDEX idx_subscriptions_user ON public.subscriptions (user_id);
CREATE INDEX idx_subscriptions_active ON public.subscriptions (user_id, status) WHERE status = 'active';
CREATE INDEX idx_subscriptions_vendor_stall ON public.subscriptions (vendor_stall_id) WHERE vendor_stall_id IS NOT NULL;

-- Payment transactions
CREATE INDEX idx_payment_transactions_user ON public.payment_transactions (user_id, created_at DESC);

-- Leaderboard
CREATE INDEX idx_leaderboard_period_rank ON public.leaderboard_snapshots (period_start, rank ASC);

-- Reporter stats
CREATE INDEX idx_reporter_stats_weekly ON public.reporter_stats (weekly_submission_count DESC);

-- Admin actions
CREATE INDEX idx_admin_actions_admin ON public.admin_actions (admin_id, created_at DESC);
CREATE INDEX idx_admin_actions_target ON public.admin_actions (target_type, target_id);

-- Account warnings
CREATE INDEX idx_account_warnings_unack ON public.account_warnings (user_id)
  WHERE acknowledged_at IS NULL;

-- Product search trends
CREATE INDEX idx_product_search_trends_date ON public.product_search_trends (trend_date, search_count DESC);
