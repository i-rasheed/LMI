-- Track explicit role selection at signup (defaults to shopper before user chooses)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role_selected_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.role_selected_at IS 'Set when user completes role-select during onboarding';
