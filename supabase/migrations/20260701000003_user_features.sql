-- LMI: Shopper features — favourites, alerts, shopping lists, searches

-- ---------------------------------------------------------------------------
-- Favourites
-- ---------------------------------------------------------------------------

CREATE TABLE public.favourites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Price alerts
-- ---------------------------------------------------------------------------

CREATE TABLE public.price_alerts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  product_id            UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  threshold_percentage  INTEGER NOT NULL DEFAULT 15,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at     TIMESTAMPTZ,
  last_known_price_naira INTEGER,
  last_known_market_id  UUID REFERENCES public.markets (id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT price_alerts_threshold CHECK (
    threshold_percentage IN (0, 10, 15, 20)
  )
);

COMMENT ON COLUMN public.price_alerts.threshold_percentage IS '0 = any drop; 10/15/20 = percentage drop threshold';

-- ---------------------------------------------------------------------------
-- Shopping lists (one per user in v1)
-- ---------------------------------------------------------------------------

CREATE TABLE public.shopping_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.shopping_list_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id     UUID NOT NULL REFERENCES public.shopping_lists (id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (list_id, product_id),
  CONSTRAINT shopping_list_items_quantity CHECK (quantity > 0 AND quantity <= 99)
);

-- ---------------------------------------------------------------------------
-- Recent searches (multi-device sync, max 10 enforced in API)
-- ---------------------------------------------------------------------------

CREATE TABLE public.recent_searches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  query       TEXT NOT NULL,
  result_type TEXT NOT NULL DEFAULT 'product',
  result_id   UUID,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recent_searches_type CHECK (result_type IN ('product', 'market', 'text'))
);

-- ---------------------------------------------------------------------------
-- Notification preferences
-- ---------------------------------------------------------------------------

CREATE TABLE public.notification_preferences (
  user_id               UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  push_enabled          BOOLEAN NOT NULL DEFAULT TRUE,
  price_drop_alerts     BOOLEAN NOT NULL DEFAULT TRUE,
  significant_changes   BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_digest         BOOLEAN NOT NULL DEFAULT TRUE,
  badge_updates         BOOLEAN NOT NULL DEFAULT TRUE,
  account_warnings      BOOLEAN NOT NULL DEFAULT TRUE,
  marketing             BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Push device tokens (Expo)
-- ---------------------------------------------------------------------------

CREATE TABLE public.push_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  device_id       TEXT,
  platform        TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, expo_push_token),
  CONSTRAINT push_devices_platform CHECK (platform IN ('ios', 'android'))
);

-- ---------------------------------------------------------------------------
-- In-app / push notification inbox
-- ---------------------------------------------------------------------------

CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles (id) ON DELETE CASCADE,
  type        public.notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}'::JSONB,
  read_at     TIMESTAMPTZ,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.notifications.user_id IS 'NULL for broadcast notifications (audience filtered at send time)';
COMMENT ON COLUMN public.notifications.data IS 'Deep link payload: { "route": "/product/...", "entity_id": "..." }';

-- ---------------------------------------------------------------------------
-- Account warnings (non-dismissable until acknowledged)
-- ---------------------------------------------------------------------------

CREATE TABLE public.account_warnings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  issued_by       UUID NOT NULL REFERENCES public.profiles (id),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  related_submission_id UUID REFERENCES public.price_submissions (id),
  acknowledged_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
