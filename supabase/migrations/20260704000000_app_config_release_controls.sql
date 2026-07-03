-- Production release controls for mobile maintenance and force-update gates.

INSERT INTO public.app_config (key, value)
VALUES
  ('latest_app_version', '"1.0.0"'::JSONB),
  ('maintenance_message', '"LMI is temporarily unavailable. Try again soon."'::JSONB),
  ('update_url', 'null'::JSONB)
ON CONFLICT (key) DO NOTHING;

DROP POLICY IF EXISTS app_config_read ON public.app_config;

CREATE POLICY app_config_read ON public.app_config
  FOR SELECT TO authenticated
  USING (
    key IN (
      'min_app_version',
      'latest_app_version',
      'maintenance_mode',
      'maintenance_message',
      'update_url'
    )
  );
