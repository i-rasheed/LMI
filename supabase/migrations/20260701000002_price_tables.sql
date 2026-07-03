-- LMI: Price submissions (audit log) + current_prices (fast reads)

-- ---------------------------------------------------------------------------
-- Price submissions — full history / audit trail
-- ---------------------------------------------------------------------------

CREATE TABLE public.price_submissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            UUID NOT NULL REFERENCES public.products (id),
  market_id             UUID NOT NULL REFERENCES public.markets (id),
  submitter_id          UUID NOT NULL REFERENCES public.profiles (id),
  source                public.price_source NOT NULL DEFAULT 'reporter',
  vendor_stall_id       UUID,  -- FK added after vendor_stalls table
  price_naira           INTEGER NOT NULL,
  unit                  public.price_unit NOT NULL,
  photo_url             TEXT,
  status                public.submission_status NOT NULL DEFAULT 'live',
  is_auto_flagged       BOOLEAN NOT NULL DEFAULT FALSE,
  auto_flag_reason      TEXT,
  flag_count            INTEGER NOT NULL DEFAULT 0,
  replaces_submission_id UUID REFERENCES public.price_submissions (id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT price_submissions_price_range CHECK (
    price_naira > 0 AND price_naira < 1000000
  )
);

COMMENT ON TABLE public.price_submissions IS 'Immutable-ish log of every price update. Current price denormalized to current_prices.';
COMMENT ON COLUMN public.price_submissions.replaces_submission_id IS 'Links reporter update chain to prior submission for same product+market+unit';

-- ---------------------------------------------------------------------------
-- Current prices — denormalized for sub-400ms comparison queries
-- ---------------------------------------------------------------------------

CREATE TABLE public.current_prices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID NOT NULL REFERENCES public.products (id),
  market_id         UUID NOT NULL REFERENCES public.markets (id),
  unit              public.price_unit NOT NULL,
  price_naira       INTEGER NOT NULL,
  submission_id     UUID NOT NULL REFERENCES public.price_submissions (id),
  submitter_id      UUID NOT NULL REFERENCES public.profiles (id),
  source            public.price_source NOT NULL,
  vendor_stall_id   UUID,
  photo_url         TEXT,
  status            public.submission_status NOT NULL DEFAULT 'live',
  flag_count        INTEGER NOT NULL DEFAULT 0,
  submitted_at      TIMESTAMPTZ NOT NULL,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, market_id, unit)
);

COMMENT ON TABLE public.current_prices IS 'Latest live price per product+market+unit; synced from price_submissions via trigger';

-- ---------------------------------------------------------------------------
-- Price flags (shopper reports)
-- ---------------------------------------------------------------------------

CREATE TABLE public.price_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES public.price_submissions (id) ON DELETE CASCADE,
  flagger_id      UUID NOT NULL REFERENCES public.profiles (id),
  reason          public.flag_reason NOT NULL,
  comment         TEXT CHECK (char_length(comment) <= 140),
  resolution      public.flag_resolution NOT NULL DEFAULT 'pending',
  resolved_by     UUID REFERENCES public.profiles (id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (submission_id, flagger_id)
);

COMMENT ON TABLE public.price_flags IS 'User reports on incorrect/outdated/spam prices; 3+ flags triggers admin review';

-- ---------------------------------------------------------------------------
-- Flag review queue metadata (denormalized for admin dashboard)
-- ---------------------------------------------------------------------------

CREATE TABLE public.flag_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL UNIQUE REFERENCES public.price_submissions (id) ON DELETE CASCADE,
  flag_count      INTEGER NOT NULL DEFAULT 0,
  is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_to     UUID REFERENCES public.profiles (id),
  escalated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.flag_reviews IS 'Admin queue entry created when submission reaches 3+ flags or auto-flagged as outlier';
