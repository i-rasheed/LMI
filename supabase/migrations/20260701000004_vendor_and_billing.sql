-- LMI: Vendor stalls, claims, analytics

-- ---------------------------------------------------------------------------
-- Vendor stalls (one per vendor account in v1)
-- ---------------------------------------------------------------------------

CREATE TABLE public.vendor_stalls (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  market_id         UUID NOT NULL REFERENCES public.markets (id),
  stall_name        TEXT NOT NULL,
  description       TEXT NOT NULL CHECK (char_length(description) <= 300),
  location_hint     TEXT NOT NULL,
  categories        TEXT[] NOT NULL DEFAULT '{}',
  photos            TEXT[] NOT NULL DEFAULT '{}',
  claim_status      public.claim_status NOT NULL DEFAULT 'pending',
  rejection_reason  TEXT,
  reviewed_by       UUID REFERENCES public.profiles (id),
  reviewed_at       TIMESTAMPTZ,
  vendor_tier       public.vendor_tier,
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  profile_view_count_7d INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.vendor_stalls IS 'One stall per vendor account; claim_status lifecycle managed by admin';

-- Add FK from price tables to vendor_stalls
ALTER TABLE public.price_submissions
  ADD CONSTRAINT price_submissions_vendor_stall_fk
  FOREIGN KEY (vendor_stall_id) REFERENCES public.vendor_stalls (id);

ALTER TABLE public.current_prices
  ADD CONSTRAINT current_prices_vendor_stall_fk
  FOREIGN KEY (vendor_stall_id) REFERENCES public.vendor_stalls (id);

-- ---------------------------------------------------------------------------
-- Vendor analytics events (Pro tier)
-- ---------------------------------------------------------------------------

CREATE TABLE public.vendor_analytics_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_stall_id UUID NOT NULL REFERENCES public.vendor_stalls (id) ON DELETE CASCADE,
  event_type      public.vendor_analytics_event NOT NULL,
  product_id      UUID REFERENCES public.products (id),
  viewer_id       UUID REFERENCES public.profiles (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.vendor_analytics_events IS 'Profile views and product clicks for Vendor Pro analytics dashboard';

-- ---------------------------------------------------------------------------
-- Subscriptions (shopper premium + vendor tiers)
-- ---------------------------------------------------------------------------

CREATE TABLE public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  vendor_stall_id           UUID REFERENCES public.vendor_stalls (id),
  plan_id                   UUID NOT NULL REFERENCES public.subscription_plans (id),
  subscription_type         public.subscription_type NOT NULL,
  status                    public.subscription_status NOT NULL DEFAULT 'active',
  paystack_customer_code    TEXT,
  paystack_subscription_code TEXT,
  paystack_email_token      TEXT,
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscriptions_vendor_link CHECK (
    (subscription_type IN ('vendor_basic', 'vendor_pro') AND vendor_stall_id IS NOT NULL)
    OR (subscription_type = 'shopper_premium' AND vendor_stall_id IS NULL)
  )
);

-- ---------------------------------------------------------------------------
-- Paystack payment transactions (webhook audit)
-- ---------------------------------------------------------------------------

CREATE TABLE public.payment_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles (id),
  subscription_id     UUID REFERENCES public.subscriptions (id),
  paystack_reference  TEXT NOT NULL UNIQUE,
  amount_kobo         INTEGER NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'NGN',
  status              TEXT NOT NULL,
  channel             TEXT,
  paid_at             TIMESTAMPTZ,
  raw_payload         JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Weekly leaderboard snapshots (cron resets Monday 00:00 WAT)
-- ---------------------------------------------------------------------------

CREATE TABLE public.leaderboard_snapshots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id       UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  submission_count  INTEGER NOT NULL DEFAULT 0,
  rank              INTEGER NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (reporter_id, period_start)
);

-- ---------------------------------------------------------------------------
-- Product search trends (cron aggregation for Home "Trending Today")
-- ---------------------------------------------------------------------------

CREATE TABLE public.product_search_trends (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  search_count  INTEGER NOT NULL DEFAULT 0,
  trend_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (product_id, trend_date)
);
