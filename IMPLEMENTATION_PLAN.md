# Lagos Market Intelligence — Implementation Plan

**Version 1.0 · July 2026**  
**Optimized for:** Cursor AI · Solo developer · Incremental delivery  
**Status:** DB schema complete (`supabase db push` ✓) — app code not started

---

## How to Use This Plan with Cursor

Each milestone is designed as **one Cursor session** (2–6 hours). Follow this loop:

```
1. Create branch:  git checkout -b milestone/MXX-short-name
2. Open Cursor:    Paste the "Cursor Prompt" block for that milestone
3. Build:          Let Cursor implement; review diff
4. Test:           Run the "Test" commands — all must pass
5. Merge:          PR → main when Definition of Done is met
6. Next milestone: Only start M(N+1) after M(N) tests pass
```

**Rules for Cursor prompts:**
- Reference `@TECH_STACK.md`, `@BACKEND_SCHEMA.md`, `@Lagos_Market_Intelligence_App_Flow.md` in every prompt
- One milestone = one concern (don't combine auth + prices)
- Always ask Cursor to match existing conventions in the repo
- Never skip tests listed in Definition of Done

---

## Defaults (Best-Practice Choices)

| Decision | Choice | Why |
|----------|--------|-----|
| Timeline | No fixed deadline; ~20 milestones | Quality + Cursor velocity over speed |
| Team | Solo + Cursor AI | Plan assumes sequential work |
| First shippable | Shopper browse + Reporter submit + Admin flags | Core value loop before payments |
| Platform | Android + iOS via Expo from day one | No extra effort with Expo |
| Design | `CONTENT_GUIDELINES.md` tokens + HTML prototype | No Figma dependency |
| Auth order | Email first → Phone OTP → Google OAuth | Unblocks dev without Twilio |
| Search | PostgreSQL FTS + trigram first; Gemini later | Fewer external deps early |
| Monetization | Milestones 17–19 (after core loop works) | Paystack last |
| Git workflow | `milestone/MXX-name` branch per milestone | Clean review + rollback |

---

## Milestone Map (Overview)

```
DONE  M00  Database schema (Supabase migrations)
      M01  Monorepo scaffold
      M02  Shared package (Zod + types)
      M03  NestJS API shell + auth guard
      M04  Expo mobile shell + navigation
      M05  Email auth + onboarding
      M06  Markets & products API + seed expansion
      M07  Home + Search screens
      M08  Product comparison + market profile
      M09  Reporter price submission flow
      M10  Price flags + admin moderation queue
      M11  Favourites + price alerts
      M12  Shopping list optimiser
      M13  Phone OTP auth
      M14  Google OAuth
      M15  Vendor stall claim + products
      M16  Push notifications pipeline
      M17  Paystack + shopper Premium
      M18  Vendor subscriptions + analytics
      M19  Gemini AI + Pidgin + polish
      M20  CI/CD, EAS, production hardening
```

---

## M00 — Database Schema ✅ DONE

**Goal:** Supabase PostgreSQL schema live on remote project.

**Deliverables:** `supabase/migrations/*`, `BACKEND_SCHEMA.md`, `supabase db push` succeeded.

**Test:**
```bash
npx supabase@2.30.4 db push   # "Finished supabase db push"
# Supabase Studio → verify tables: profiles, markets, products, current_prices
```

---

## M01 — Monorepo Scaffold

**Goal:** Runnable empty monorepo matching `TECH_STACK.md` layout.

**Scope:**
- Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`
- Empty `apps/mobile`, `apps/api`, `packages/shared` with pinned deps
- `.gitignore`, `.env.example` files
- `README.md` with dev setup instructions

**Cursor Prompt:**
```
Read @TECH_STACK.md. Scaffold the LMI monorepo:
- Root workspace with pnpm 10.12.1, turbo 2.5.4, Node 20.19.4
- apps/mobile: Expo SDK 55 placeholder (expo-router entry)
- apps/api: NestJS 11 placeholder (health endpoint)
- packages/shared: empty export
Use exact dependency pins from TECH_STACK. Include .env.example for mobile and api.
Do not implement features yet.
```

**Test:**
```bash
pnpm install
pnpm typecheck        # passes (empty projects)
pnpm --filter @lmi/api dev   # GET http://localhost:3000/health → 200
pnpm --filter @lmi/mobile dev  # Expo starts without crash
```

**Definition of Done:**
- [ ] `pnpm install` succeeds with frozen lockfile
- [ ] API returns `{ "status": "ok" }` on `/health`
- [ ] Mobile app shows placeholder screen

---

## M02 — Shared Package (Zod Schemas + Types)

**Goal:** Single source of truth for validation shared by mobile and API.

**Scope:**
- `packages/shared/src/schemas/`: register, login, submitPrice, stallClaim, vendorProduct, alert, flagPrice, profile
- `packages/shared/src/types/`: enums mirroring DB (user_role, price_unit, etc.)
- `packages/shared/src/constants/`: freemium limits, API paths
- Build script exports to `dist/`

**Cursor Prompt:**
```
Read @BACKEND_SCHEMA.md and @Lagos_Market_Intelligence_App_Flow.md §25.3.
Create @lmi/shared with Zod 3.25.67 schemas listed in TECH_STACK §8.
Match DB enums exactly. Export freemium limits from PRD §7.2 (5 list items, 3 alerts, 10 favourites).
Add unit tests for each schema (valid + invalid cases).
```

**Test:**
```bash
pnpm --filter @lmi/shared test
pnpm --filter @lmi/shared build
pnpm typecheck
```

**Definition of Done:**
- [ ] 8 Zod schemas exported
- [ ] Jest tests pass for edge cases (phone format, price range, alert threshold)
- [ ] Mobile and API can import `@lmi/shared`

---

## M03 — NestJS API Shell + Auth Guard

**Goal:** API foundation with Supabase JWT verification.

**Scope:**
- `main.ts`: helmet, compression, CORS, global prefix `/api/v1`
- `AuthModule`: JWKS guard via `jose`, `@CurrentUser()` decorator
- `SupabaseModule`: service-role client provider
- `UsersModule`: `GET /users/me` returns profile from DB
- Swagger at `/api/docs`
- `@nestjs/throttler` configured

**Cursor Prompt:**
```
Read @TECH_STACK.md §7 and @BACKEND_SCHEMA.md §3, §12.1.
Implement NestJS API shell in apps/api:
- AuthGuard verifying Supabase JWT (jose JWKS)
- SupabaseModule with service-role client
- GET /api/v1/users/me (create profile if missing)
- GET /api/v1/health, GET /api/v1/config (min_app_version from app_config)
- Swagger, throttler, zod validation pipe (nestjs-zod)
Use @lmi/shared types. Add e2e test for /health and auth rejection on /users/me.
```

**Test:**
```bash
pnpm --filter @lmi/api test
pnpm --filter @lmi/api test:e2e
# Manual: curl /api/v1/users/me without token → 401
# Manual: curl with Supabase access token → 200 + profile
```

**Definition of Done:**
- [ ] JWT guard rejects invalid tokens
- [ ] `/users/me` returns profile for authenticated user
- [ ] E2e tests pass

---

## M04 — Expo Mobile Shell + Navigation

**Goal:** App boots with Expo Router, providers, and role-aware tab skeleton.

**Scope:**
- `app/_layout.tsx`: QueryClient, auth gate, splash
- `(auth)/welcome.tsx` placeholder
- `(tabs)/_layout.tsx`: 5 shopper tabs (empty screens)
- `src/theme/`: design tokens from CONTENT_GUIDELINES
- `src/stores/authStore.ts`, Supabase client + SecureStore
- `@lmi/shared` wired in

**Cursor Prompt:**
```
Read @Lagos_Market_Intelligence_App_Flow.md §2-§3 and @CONTENT_GUIDELINES.md §3.
Scaffold apps/mobile:
- Expo Router file structure from App Flow §3 (shell only, placeholder content)
- Theme tokens: green #0A8F52, Plus Jakarta Sans, spacing, card radius
- Supabase client with expo-secure-store
- Zustand authStore + TanStack Query provider
- Role-aware tab config (shopper 5 tabs; vendor/admin tabs empty placeholders)
No feature logic yet — "Coming soon" placeholders on each tab.
```

**Test:**
```bash
pnpm --filter @lmi/mobile typecheck
# Expo dev client: app launches, shows Welcome or tab skeleton
# No red screen errors
```

**Definition of Done:**
- [ ] App launches on iOS simulator and Android emulator
- [ ] Navigation between auth and tabs works
- [ ] Theme tokens used (no hardcoded random colors)

---

## M05 — Email Auth + Onboarding

**Goal:** Full email registration/login flow through to role select and onboarding.

**Scope:**
- Screens: welcome, register, login, forgot-password, role-select, onboarding 1–3
- RHF + Zod with `@lmi/shared` schemas
- Profile creation via API (`POST /auth/register`, `PATCH /users/me`)
- Blocked account redirect (`account_status !== active`)
- Age checkbox on register

**Cursor Prompt:**
```
Implement auth flow from @Lagos_Market_Intelligence_App_Flow.md §5-§6.
Mobile: welcome, register (email+password), login, forgot-password, role-select, onboarding 3 steps.
Use supabase.auth.signUp/signInWithPassword. On success call API to set role + onboarding_completed_at.
Redirect to /blocked if account_status is suspended/banned.
Match copy from @CONTENT_GUIDELINES.md §10.1-§10.2.
Add Maestro flow or Detox-free manual test checklist in apps/mobile/TESTING.md.
```

**Test:**
```bash
# Register new user → role select → onboarding → lands on Home tab
# Login existing user → skips onboarding → Home
# Sign out → Welcome
# Set account_status=suspended in Supabase Studio → app shows /blocked
```

**Definition of Done:**
- [ ] End-to-end email signup works against remote Supabase
- [ ] Role persisted in profiles table
- [ ] Session persists across app restart

---

## M06 — Markets & Products API + Seed Data

**Goal:** Backend endpoints for catalogue; expanded seed data for dev.

**Scope:**
- `MarketsModule`: GET list, GET by id, GET nearby (haversine)
- `ProductsModule`: GET search (FTS + trigram), GET by id, GET trending, GET categories
- Seed migration: 15+ markets, 50+ products with aliases
- Mobile: none yet (API only)

**Cursor Prompt:**
```
Read @BACKEND_SCHEMA.md §12.3-§12.4.
Implement MarketsModule and ProductsModule in apps/api:
- GET /markets, /markets/:id, /markets/nearby?lat=&lng=&radius_km=
- GET /products/search?q=, /products/:id, /products/trending, /products/categories
Use PostgreSQL FTS (search_vector) + pg_trgm fallback.
Add supabase/migrations/20260702000000_expand_seed_data.sql with 15 Lagos markets and 50 products.
Write e2e tests for search ("tomatoe" → Tomatoes) and nearby markets sort.
```

**Test:**
```bash
npx supabase@2.30.4 db push
pnpm --filter @lmi/api test:e2e
curl "localhost:3000/api/v1/products/search?q=tomato"  # returns Tomatoes
curl "localhost:3000/api/v1/markets/nearby?lat=6.5244&lng=3.3792"  # sorted by distance
```

**Definition of Done:**
- [ ] Search returns relevant products with aliases
- [ ] Nearby markets sorted by distance
- [ ] Seed data visible in Supabase Studio

---

## M07 — Home + Search Screens

**Goal:** Shopper can browse trending products and search the catalogue.

**Scope:**
- `/(tabs)/home`: greeting, search bar, nearby markets, trending, price drops (drops = empty OK)
- `/(tabs)/search`: idle state, autocomplete, category grid
- TanStack Query hooks: `useMarkets`, `useProductSearch`, `useTrending`
- Skeleton loading + pull-to-refresh + error states per App Flow §19–§20

**Cursor Prompt:**
```
Implement Home and Search tabs from @Lagos_Market_Intelligence_App_Flow.md §8.1, §9.
Wire to API from M06. Use FlashList, skeleton loaders, empty/error states from @CONTENT_GUIDELINES.md §12.
Location: optional — if denied, show alphabetical markets + banner.
Tap product → navigate to /product/[id] (placeholder screen for now).
Tap market → navigate to /market/[id] (placeholder).
```

**Test:**
```bash
# Home loads trending products and nearby markets (with location)
# Search: type "tom" → autocomplete shows Tomatoes
# Search: browse categories → product list
# Pull to refresh works
# Airplane mode → error banner, retry works
```

**Definition of Done:**
- [ ] Home and Search fully wired to API
- [ ] Loading, empty, error states implemented
- [ ] Navigation to detail placeholders works

---

## M08 — Product Comparison + Market Profile

**Goal:** Core shopper value — compare prices across markets.

**Scope:**
- `/product/[id]`: price list sorted cheapest/freshest, filter sheet, save/alert/share footer (save/alert = stub)
- `/market/[id]`: hero, hours, map preview, price list, vendor section
- API: `GET /prices/:productId/compare`, filters, sort
- Freshness badges (green/amber/red) per App Flow Appendix B

**Cursor Prompt:**
```
Implement Product Comparison and Market Profile from @Lagos_Market_Intelligence_App_Flow.md §8.1.
API: GET /prices/:productId/compare with sort (cheapest|freshest|nearest) and filters.
Show reporter badge, freshness badge, unit on every price row.
Footer: Save, Alert, Share buttons (Share uses system share sheet with lmi.ng link).
Premium price history chart: show locked padlock placeholder (no chart yet).
```

**Test:**
```bash
# Seed at least 3 current_prices for Tomatoes across markets (via SQL or reporter flow in M09)
# Product page shows prices sorted cheapest first
# Freshness badges correct for submitted_at timestamps
# Share opens native share sheet
# Market profile shows prices and opening hours
```

**Definition of Done:**
- [ ] Price comparison renders with real DB data
- [ ] Sort and filter work
- [ ] Trust UI: unit + freshness + reporter on every row

---

## M09 — Reporter Price Submission Flow

**Goal:** Reporters can submit and update prices with photo upload.

**Scope:**
- FAB on reporter accounts
- `/submit/*` 4-step flow + guidelines modal
- API: `POST /prices`, `PATCH /prices/:id`, duplicate check, outlier warning
- Supabase Storage upload to `submissions/` bucket
- Success screen with badge progress

**Cursor Prompt:**
```
Implement Reporter submission flow from @Lagos_Market_Intelligence_App_Flow.md §12.
API: POST /prices (reporter role guard), PATCH /prices/:id.
Enforce: duplicate 30min block, outlier warning (return warning, allow override).
Mobile: FAB, 4-step modal stack, image picker + compress + upload to submissions bucket.
Guidelines modal on first FAB tap. Success screen with badge progress from reporter_stats.
Validate with submitPriceSchema from @lmi/shared.
```

**Test:**
```bash
# Register as reporter → FAB visible
# Submit tomatoes @ Mile 12 → appears on product comparison immediately
# Duplicate submit within 30min → blocked with error message
# Outlier price (>50% from avg) → warning banner, submits as under_review
# Submit with photo → photo_url populated
# Update existing price from submission history
```

**Definition of Done:**
- [ ] Submission live on comparison screen after submit
- [ ] Duplicate and outlier guards work
- [ ] Photo upload to Supabase Storage works

---

## M10 — Price Flags + Admin Moderation

**Goal:** Community flagging and admin review queue.

**Scope:**
- Flag price bottom sheet (shopper)
- API: `POST /prices/:id/flag`
- Admin tab + `/admin/flags` queue + `/admin/flags/[id]` review
- Actions: confirm, edit, remove, warn, ban — logged to `admin_actions`
- Create first admin user via seed/script

**Cursor Prompt:**
```
Implement flagging (@Lagos_Market_Intelligence_App_Flow.md §8.3) and admin moderation (§14).
API: POST /prices/:submissionId/flag, GET/PATCH /admin/flags/:id.
Admin actions write to admin_actions table. Warn creates account_warnings row.
Mobile: flag bottom sheet, admin tab (6th tab for admin role), flag queue + review screen.
Add scripts/create-admin.ts to promote a user to admin role.
Optional: Supabase Realtime subscription on flag_reviews for admin queue.
```

**Test:**
```bash
# Shopper flags a price → flag_count increments
# 3 flags → submission status under_review, appears in admin queue
# Admin confirm → flags cleared, status live
# Admin remove → price removed from comparison
# Admin warn → user sees warning modal on next open
# admin_actions row created for each action
```

**Definition of Done:**
- [ ] Full flag → review → action loop works
- [ ] Admin audit log populated
- [ ] Non-admin cannot access admin endpoints (403)

---

## M11 — Favourites + Price Alerts

**Goal:** Shoppers save products and set price drop alerts.

**Scope:**
- API: CRUD favourites, CRUD alerts with freemium limit checks
- `/profile/favourites`, alert bottom sheet on product page
- `/(tabs)/alerts`: alerts list + activity inbox stub
- Paywall placeholder when exceeding free limits (11th favourite, 4th alert)

**Cursor Prompt:**
```
Implement favourites and alerts from @Lagos_Market_Intelligence_App_Flow.md §8.2, §17.2.
API: GET/POST/DELETE /favourites, GET/POST/PATCH/DELETE /alerts.
Enforce freemium limits via check_freemium_limit (10 favourites, 3 alerts).
Mobile: heart toggle on product page, alert bottom sheet (threshold selector).
Show paywall modal placeholder when limit exceeded (full paywall in M17).
Alerts tab: active alerts list with toggle.
```

**Test:**
```bash
# Save favourite → appears in /profile/favourites
# 11th favourite → paywall modal shown
# Set alert with 15% threshold → saved
# 4th alert → paywall modal
# Delete favourite → removed
```

**Definition of Done:**
- [ ] Favourites and alerts persist
- [ ] Freemium limits enforced server-side
- [ ] Alert toggle works

---

## M12 — Shopping List Optimiser

**Goal:** Build list and find cheapest single market.

**Scope:**
- `/(tabs)/list`: add/remove items, swipe delete
- API: list CRUD, `POST /list/optimise`
- `/list/result`: ranked markets, item breakdown
- Free: 5 items; Premium distance/savings = locked placeholder

**Cursor Prompt:**
```
Implement shopping list optimiser from @Lagos_Market_Intelligence_App_Flow.md §11.
API: GET/POST/DELETE /list/items, POST /list/optimise.
Algorithm: single market minimising total cost; report item coverage (8/10 found).
Mobile: list tab, add from search overlay, optimiser result screen.
Free limit 5 items with paywall at 6th. Premium savings/distance show lock icon.
```

**Test:**
```bash
# Add 3 items → optimise → returns ranked markets with totals
# Market with missing items shows N/A in breakdown
# 6th item → paywall
# Empty list → CTA disabled
```

**Definition of Done:**
- [ ] Optimiser returns correct cheapest market for test data
- [ ] Item breakdown expandable
- [ ] 5-item free limit enforced

---

## M13 — Phone OTP Auth

**Goal:** Phone registration and passwordless login.

**Scope:**
- Configure Twilio/MessageBird in Supabase dashboard (document steps)
- `verify-otp` screen, phone register/login paths
- Update `supabase/config.toml` for SMS

**Cursor Prompt:**
```
Implement phone OTP auth from @Lagos_Market_Intelligence_App_Flow.md §5.
Mobile: verify-otp screen (6-digit, auto-advance), phone path on register/login.
Use supabase.auth.signInWithOtp and verifyOtp.
Document Twilio setup in README (Supabase dashboard steps).
Keep email auth working alongside phone.
```

**Test:**
```bash
# Register with +234 phone → OTP received → verify → role select
# Login with phone → OTP → Home
# Invalid OTP → error with attempts remaining
```

**Definition of Done:**
- [ ] Phone signup and login work with real SMS
- [ ] Email auth still works

---

## M14 — Google OAuth

**Goal:** Social login via Google.

**Scope:**
- Supabase Google provider config
- `signInWithOAuth` + Expo AuthSession
- New users → role select; returning → Home

**Cursor Prompt:**
```
Implement Google OAuth from @Lagos_Market_Intelligence_App_Flow.md §5.
Use expo-auth-session + supabase.auth.signInWithOAuth.
Update supabase/config.toml with env-based google client_id/secret.
Add "Continue with Google" to welcome/register/login screens.
```

**Test:**
```bash
# Google sign-in → new user → role select
# Google sign-in → returning user → Home
```

**Definition of Done:**
- [ ] Google OAuth works on iOS and Android dev builds

---

## M15 — Vendor Stall Claim + Products

**Goal:** Vendors can claim stalls and publish product listings.

**Scope:**
- Vendor tab layout (dashboard, products)
- Claim flow: market → stall → status
- API: vendor claim CRUD, admin approve/reject, vendor products
- Vendor onboarding lands on claim flow

**Cursor Prompt:**
```
Implement vendor journeys from @Lagos_Market_Intelligence_App_Flow.md §13.
API: POST /vendors/claim, GET /vendors/claim/status, POST/PATCH /vendors/products.
Admin: GET/PATCH /admin/claims/:id (approve/reject).
Mobile: vendor tabs, claim flow, product add/edit, dashboard preview when pending.
Vendor product creates price_submission with source=vendor.
```

**Test:**
```bash
# Register as vendor → lands on claim flow
# Submit claim → status pending → admin approves → dashboard live
# Add product listing → appears on market profile vendor section
# Rejected claim → edit & resubmit
```

**Definition of Done:**
- [ ] Full claim → approve → publish loop
- [ ] Vendor products visible to shoppers

---

## M16 — Push Notifications Pipeline

**Goal:** Register devices and deliver push notifications.

**Scope:**
- `POST /devices/token`
- `NotificationsModule`: create notification row, dispatch via Expo Push API
- Cron: price drop alert evaluation (Render cron or `@nestjs/schedule`)
- Mobile: register token on login, notification permissions explainer
- Alerts tab: activity inbox

**Cursor Prompt:**
```
Implement push pipeline from @Lagos_Market_Intelligence_App_Flow.md §17, @TECH_STACK.md §25.8.
API: POST /devices/token, GET /notifications, PATCH /notifications/:id/read.
NestJS @nestjs/schedule job: evaluate price_alerts every 15min, send price_drop notifications.
Use expo-server-sdk. Store in notifications table.
Mobile: expo-notifications setup, permission explainer before first favourite/alert.
Populate activity inbox on Alerts tab.
```

**Test:**
```bash
# Register push token on login
# Change price in DB >15% drop → cron sends push (or manual trigger endpoint for dev)
# Tap notification → deep links to product page
# Notification appears in activity inbox
```

**Definition of Done:**
- [ ] Push token registered
- [ ] Price drop alert fires on threshold
- [ ] Deep links work

---

## M17 — Paystack + Shopper Premium

**Goal:** Monetize premium features.

**Scope:**
- Paystack initialize + webhook
- Premium paywall screen, subscription management
- Unlock: unlimited list/alerts/favourites, price history chart, optimiser savings

**Cursor Prompt:**
```
Implement shopper Premium from @Lagos_Market_Intelligence_App_Flow.md §18, @TECH_STACK.md §25.9.
API: GET /subscriptions/plans, POST /subscriptions/initialize, POST /webhooks/paystack, GET /subscriptions/me.
Mobile: /premium/upgrade paywall, Paystack WebView, subscription status in profile.
Unlock Premium features when has_active_premium. Price history chart with react-native-gifted-charts.
Use Paystack test keys. Webhook updates subscriptions table.
```

**Test:**
```bash
# Paystack test payment → subscription active
# 11th favourite allowed for premium user
# Price history chart visible
# Cancel subscription → access until period end
# Webhook replay handled idempotently
```

**Definition of Done:**
- [ ] Test payment completes
- [ ] Premium gates removed for subscriber
- [ ] Webhook updates DB correctly

---

## M18 — Vendor Subscriptions + Analytics

**Goal:** Vendor Basic/Pro tiers with analytics.

**Scope:**
- Vendor subscription paywall
- Pro: analytics tab (views, clicks charts)
- Promoted search placement flag for Pro vendors
- `vendor_analytics_events` tracking

**Cursor Prompt:**
```
Implement vendor monetization from @Lagos_Market_Intelligence_App_Flow.md §13.3-§13.4.
API: vendor subscription via Paystack, GET /vendors/analytics, POST /vendors/analytics/event.
Mobile: vendor subscription screen, analytics tab (Pro only, upsell for Basic).
Track profile_view and product_click events.
Pro vendors sort higher in search results (promoted flag).
```

**Test:**
```bash
# Vendor Basic subscription → can publish products
# Vendor Pro → analytics tab shows charts
# Basic tier → analytics tab shows upsell
# profile_view event increments
```

**Definition of Done:**
- [ ] Both vendor tiers purchasable
- [ ] Analytics dashboard shows data for Pro

---

## M19 — Gemini AI + Pidgin + Polish

**Goal:** Should Have features and UX polish.

**Scope:**
- `AiModule`: search assist, outlier explain, admin moderate summary, weekly digest
- Pidgin strings (i18next)
- Badge celebration modal, leaderboard screen
- Reporter submission history, public profiles

**Cursor Prompt:**
```
Implement Should Have features from @Lagos_Market_Intelligence_App_Flow.md §25.7, @CONTENT_GUIDELINES.md §13.
API: POST /ai/search, /ai/explain-outlier, /ai/moderate, /ai/digest (Gemini 2.0 flash).
Mobile: i18next Pidgin toggle, badge level-up modal, leaderboard, public reporter profile.
Reporter submission history screen. Weekly digest cron for premium users.
Fallback to FTS if Gemini unavailable.
```

**Test:**
```bash
# Language toggle → Pidgin strings on tabs/CTAs
# Search fallback: Gemini enhances "tomatoe" suggestion
# Badge unlock → celebration modal
# Leaderboard shows weekly rankings
```

**Definition of Done:**
- [ ] Pidgin toggle works
- [ ] Gemini search assist with FTS fallback
- [ ] Leaderboard and badges complete

---

## M20 — CI/CD, EAS, Production Hardening

**Goal:** Ship to App Store and Play Store.

**Scope:**
- GitHub Actions: lint, typecheck, test on PR
- EAS Build profiles (development, preview, production)
- Sentry + PostHog wired
- Account deletion flow (NDPR)
- Force update + maintenance screens wired to `/config`
- Maestro E2E: auth, search, submit

**Cursor Prompt:**
```
Implement production readiness from @TECH_STACK.md §13, §10.
GitHub Actions: pnpm install, typecheck, test, lint on PR.
eas.json with development/preview/production profiles.
Wire Sentry + PostHog. Implement delete account flow (7-day grace) from App Flow §16.4.
/config endpoint drives force-update and maintenance screens.
Maestro flows: register, search product, submit price.
```

**Test:**
```bash
# CI passes on PR
# eas build --profile preview succeeds
# Delete account → pending_deletion → login within 7 days cancels
# X-Min-Version header → force-update screen
```

**Definition of Done:**
- [ ] CI green
- [ ] Preview build installable on device
- [ ] Account deletion works
- [ ] Maestro smoke test passes

---

## Cursor Session Tips

### Prompt template (copy for any milestone)

```
Milestone: MXX — [Name]
Branch: milestone/MXX-[name]

Context:
- @TECH_STACK.md — dependency pins
- @BACKEND_SCHEMA.md — DB schema + API spec
- @Lagos_Market_Intelligence_App_Flow.md — screens + flows
- @CONTENT_GUIDELINES.md — UI copy + tokens

Task: [paste milestone scope]

Constraints:
- Match existing code conventions in the repo
- Use @lmi/shared Zod schemas for all forms/API DTOs
- Minimum scope — no unrelated changes
- Include tests listed in Definition of Done

When done, list: files changed, how to test, any env vars needed.
```

### What NOT to do in Cursor

- Don't implement multiple milestones in one prompt
- Don't upgrade dependency versions without updating TECH_STACK.md
- Don't add Prisma/TypeORM (use Supabase JS client)
- Don't expose Gemini or Paystack secrets to mobile

---

## Environment Checklist (Collect Before M03)

| Variable | Where | Needed by |
|----------|-------|-----------|
| `SUPABASE_URL` | mobile + api | M03 |
| `SUPABASE_ANON_KEY` | mobile | M04 |
| `SUPABASE_SERVICE_ROLE_KEY` | api | M03 |
| `DATABASE_URL` | api | M03 |
| `PAYSTACK_SECRET_KEY` | api | M17 |
| `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY` | mobile | M17 |
| `GOOGLE_GEMINI_API_KEY` | api | M19 |
| `EXPO_ACCESS_TOKEN` | api | M16 |
| `GOOGLE_MAPS_API_KEY` | mobile | M07 |

---

## Risk Register

| Risk | Mitigation milestone |
|------|---------------------|
| No price data at launch | M06 seed + M09 reporter submissions |
| Supabase SMS config friction | M05 email first; M13 phone later |
| Paystack webhook on Render | M17: use ngrok for local webhook test |
| Expo Maps requires dev client | M04: use expo-dev-client from start |
| Scope creep | Strict one-milestone-per-PR rule |

---

*CONFIDENTIAL — FOR INTERNAL USE ONLY*  
*Lagos Market Intelligence · Implementation Plan v1.0*
