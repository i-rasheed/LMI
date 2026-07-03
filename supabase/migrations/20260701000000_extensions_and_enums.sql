-- LMI: Extensions and enum types
-- Timezone: all timestamps stored as timestamptz; application logic uses Africa/Lagos (WAT, UTC+1)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM (
  'shopper',
  'reporter',
  'vendor',
  'admin'
);

CREATE TYPE public.account_status AS ENUM (
  'active',
  'suspended',
  'banned',
  'pending_deletion'
);

CREATE TYPE public.language_preference AS ENUM (
  'en',
  'pcm'
);

CREATE TYPE public.theme_preference AS ENUM (
  'light',
  'system'
);

CREATE TYPE public.badge_level AS ENUM (
  'bronze',
  'silver',
  'gold',
  'elite'
);

CREATE TYPE public.price_unit AS ENUM (
  'kg',
  'piece',
  'bunch',
  'litre',
  'crate',
  'bag'
);

CREATE TYPE public.product_category AS ENUM (
  'vegetables',
  'grains',
  'protein',
  'spices',
  'oils',
  'fruits',
  'other'
);

CREATE TYPE public.price_source AS ENUM (
  'reporter',
  'vendor'
);

CREATE TYPE public.submission_status AS ENUM (
  'live',
  'flagged',
  'under_review',
  'removed'
);

CREATE TYPE public.flag_reason AS ENUM (
  'incorrect_price',
  'outdated',
  'spam'
);

CREATE TYPE public.flag_resolution AS ENUM (
  'pending',
  'confirmed',
  'edited',
  'removed'
);

CREATE TYPE public.claim_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE public.vendor_tier AS ENUM (
  'basic',
  'pro'
);

CREATE TYPE public.subscription_type AS ENUM (
  'shopper_premium',
  'vendor_basic',
  'vendor_pro'
);

CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'cancelled',
  'past_due',
  'expired',
  'trialing'
);

CREATE TYPE public.billing_interval AS ENUM (
  'monthly',
  'annual'
);

CREATE TYPE public.notification_type AS ENUM (
  'price_drop',
  'new_price',
  'weekly_digest',
  'badge_level_up',
  'stall_claim_approved',
  'stall_claim_rejected',
  'account_warning',
  'broadcast',
  'subscription_renewal',
  'flag_threshold',
  'submission_streak'
);

CREATE TYPE public.admin_action_type AS ENUM (
  'flag_confirm',
  'flag_edit',
  'flag_remove',
  'warn_reporter',
  'ban_reporter',
  'verify_reporter',
  'revoke_reporter',
  'approve_claim',
  'reject_claim',
  'suspend_user',
  'unsuspend_user',
  'create_product',
  'update_product',
  'delete_product',
  'create_market',
  'update_market',
  'delete_market',
  'send_broadcast'
);

CREATE TYPE public.vendor_analytics_event AS ENUM (
  'profile_view',
  'product_click'
);
