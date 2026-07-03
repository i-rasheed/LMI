# Lagos Market Intelligence (LMI)

Cross-platform mobile app for Lagos market price intelligence.

## Prerequisites

- Node.js **20.19.4** (`nvm use`)
- pnpm **10.12.1**
- Docker (optional, for local Supabase)

## Setup

```bash
pnpm install
pnpm --filter @lmi/shared build
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
# Fill in Supabase credentials
```

## Development

```bash
# API (http://localhost:3000/api/v1/health)
pnpm --filter @lmi/api dev

# Mobile (Expo dev client)
pnpm --filter @lmi/mobile dev
```

## Verify

```bash
pnpm typecheck
pnpm --filter @lmi/api test:e2e
curl http://localhost:3000/api/v1/health
```

## Phone OTP Setup

Phone registration/login uses Supabase Auth SMS OTP from the mobile app:

- Register: `supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } })`
- Login: `supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: false } })`
- Verify: `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`

To receive real SMS codes in the hosted Supabase project:

1. Open Supabase Dashboard → Authentication → Providers → Phone.
2. Enable Phone provider and Phone signups.
3. Choose Twilio as the SMS provider.
4. Enter Twilio Account SID, Auth Token, and Messaging Service SID or From number.
5. Save, then test with a `+234...` phone number from the mobile app.

For local Supabase, `supabase/config.toml` enables SMS signups. The local CLI can expose OTPs through its local auth tooling/Studio; configure provider-specific `[auth.sms.twilio]` settings only if you need local SMS delivery.

## Paystack Premium Setup

Shopper Premium uses Paystack test checkout from the API:

- Set `PAYSTACK_SECRET_KEY` in `apps/api/.env`.
- Set `EXPO_PUBLIC_PAYSTACK_CALLBACK_URL` in `apps/mobile/.env`.
- In Paystack, point webhooks to `/api/v1/webhooks/paystack`.
- Webhook `charge.success` events activate `shopper_premium` subscriptions.

## Monorepo layout

```
apps/mobile     Expo SDK 55 · React Native
apps/api        NestJS 11 REST API
packages/shared Zod schemas & types (M02)
supabase/       Database migrations
```

See `IMPLEMENTATION_PLAN.md` for milestone-by-milestone build guide.
