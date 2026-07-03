-- LMI: Core tables — profiles, markets, products

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name          TEXT,
  phone                 TEXT,
  email                 TEXT,
  role                  public.user_role NOT NULL DEFAULT 'shopper',
  language_preference   public.language_preference NOT NULL DEFAULT 'en',
  theme_preference      public.theme_preference NOT NULL DEFAULT 'light',
  account_status        public.account_status NOT NULL DEFAULT 'active',
  bio                   TEXT CHECK (char_length(bio) <= 160),
  avatar_url            TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  guidelines_accepted_at  TIMESTAMPTZ,
  is_verified_reporter  BOOLEAN NOT NULL DEFAULT FALSE,
  reporter_verified_at  TIMESTAMPTZ,
  reporter_verified_by  UUID REFERENCES public.profiles (id),
  current_badge_level   public.badge_level,
  suspension_reason     TEXT,
  banned_at             TIMESTAMPTZ,
  deleted_at            TIMESTAMPTZ,
  permanent_delete_at   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_phone_format CHECK (
    phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$'
  ),
  CONSTRAINT profiles_email_format CHECK (
    email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

COMMENT ON TABLE public.profiles IS 'Application profile for each auth.users row. Role and account status enforced here.';
COMMENT ON COLUMN public.profiles.deleted_at IS 'Soft-delete requested; permanent_delete_at = deleted_at + 7 days';

-- ---------------------------------------------------------------------------
-- Markets
-- ---------------------------------------------------------------------------

CREATE TABLE public.markets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  area            TEXT NOT NULL,
  description     TEXT,
  latitude        NUMERIC(10, 7) NOT NULL,
  longitude       NUMERIC(10, 7) NOT NULL,
  opening_hours   JSONB NOT NULL DEFAULT '{}'::JSONB,
  photo_url       TEXT,
  categories      TEXT[] NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT markets_lat_range CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT markets_lng_range CHECK (longitude BETWEEN -180 AND 180)
);

COMMENT ON TABLE public.markets IS 'Lagos open-air market directory';
COMMENT ON COLUMN public.markets.opening_hours IS 'JSON: { "mon": { "open": "06:00", "close": "18:00" }, ... }';

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

CREATE TABLE public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  category        public.product_category NOT NULL DEFAULT 'other',
  default_unit    public.price_unit NOT NULL DEFAULT 'kg',
  allowed_units   public.price_unit[] NOT NULL DEFAULT ARRAY['kg']::public.price_unit[],
  photo_url       TEXT,
  search_vector   TSVECTOR,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.products IS 'Admin-managed product catalogue';

-- ---------------------------------------------------------------------------
-- Product aliases (fuzzy search: tomatoe → tomato)
-- ---------------------------------------------------------------------------

CREATE TABLE public.product_aliases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  alias       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, alias)
);

-- ---------------------------------------------------------------------------
-- Reporter stats (denormalized for badges, streaks, leaderboard)
-- ---------------------------------------------------------------------------

CREATE TABLE public.reporter_stats (
  reporter_id               UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  accepted_submission_count INTEGER NOT NULL DEFAULT 0,
  current_streak_days       INTEGER NOT NULL DEFAULT 0,
  longest_streak_days       INTEGER NOT NULL DEFAULT 0,
  last_submission_date      DATE,
  weekly_submission_count   INTEGER NOT NULL DEFAULT 0,
  week_start_date           DATE,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.reporter_stats IS 'Denormalized reporter metrics; updated by triggers on price_submissions';

-- ---------------------------------------------------------------------------
-- Reporter badges (historical record — badges do not downgrade)
-- ---------------------------------------------------------------------------

CREATE TABLE public.reporter_badges (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id             UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  badge_level             public.badge_level NOT NULL,
  earned_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submission_count_at_earn INTEGER NOT NULL,
  UNIQUE (reporter_id, badge_level)
);

-- ---------------------------------------------------------------------------
-- Subscription plan reference data
-- ---------------------------------------------------------------------------

CREATE TABLE public.subscription_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type         public.subscription_type NOT NULL,
  name              TEXT NOT NULL,
  amount_kobo       INTEGER NOT NULL,
  billing_interval  public.billing_interval NOT NULL,
  paystack_plan_code TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plan_type, billing_interval)
);

COMMENT ON COLUMN public.subscription_plans.amount_kobo IS 'Paystack amounts in kobo (₦1,500 = 150000)';
