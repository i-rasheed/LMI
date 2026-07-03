-- LMI: Admin audit log and broadcast campaigns

CREATE TABLE public.admin_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID NOT NULL REFERENCES public.profiles (id),
  action_type   public.admin_action_type NOT NULL,
  target_type   TEXT NOT NULL,
  target_id     UUID NOT NULL,
  metadata      JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.admin_actions IS 'Immutable audit log of all admin moderation and catalogue actions';

CREATE TABLE public.broadcast_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID NOT NULL REFERENCES public.profiles (id),
  title         TEXT NOT NULL CHECK (char_length(title) <= 60),
  body          TEXT NOT NULL CHECK (char_length(body) <= 200),
  audience      TEXT NOT NULL,
  sent_count    INTEGER NOT NULL DEFAULT 0,
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT broadcast_audience CHECK (
    audience IN ('all', 'shoppers', 'reporters', 'vendors')
  )
);

-- ---------------------------------------------------------------------------
-- App config (maintenance mode, min version)
-- ---------------------------------------------------------------------------

CREATE TABLE public.app_config (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.app_config (key, value) VALUES
  ('min_app_version', '"1.0.0"'::JSONB),
  ('maintenance_mode', 'false'::JSONB);
