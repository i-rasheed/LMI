# Lagos Market Intelligence
## App Flow Document

**Version 1.1 · Confidential**  
**Prepared:** July 2026  
**Companion to:** Lagos Market Intelligence PRD v1.0 · TECH_STACK.md v1.0  
**Platform:** React Native 0.82 · Expo SDK 55 · TypeScript · Expo Router

---

## Document Purpose

This document defines every screen, navigation pattern, transition, and UI state in the LMI mobile application. It is the single source of truth for design and engineering during v1 build. Decisions not explicitly stated in the PRD are resolved here using product best practices and Nigerian fintech UX conventions (OPay, PalmPay, Cowrywise).

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Navigation Architecture](#2-navigation-architecture)
3. [Route Map (Expo Router)](#3-route-map-expo-router)
4. [Screen Inventory](#4-screen-inventory)
5. [Authentication Flow](#5-authentication-flow)
6. [Onboarding Flow](#6-onboarding-flow)
7. [Permission Flows](#7-permission-flows)
8. [Shopper Journeys](#8-shopper-journeys)
9. [Search Flow](#9-search-flow)
10. [Maps & Location](#10-maps--location)
11. [Shopping List Optimiser](#11-shopping-list-optimiser)
12. [Price Submission Flow (Reporter)](#12-price-submission-flow-reporter)
13. [Vendor Journeys](#13-vendor-journeys)
14. [Admin Journeys](#14-admin-journeys)
15. [Profile & Public Profiles](#15-profile--public-profiles)
16. [Settings](#16-settings)
17. [Notifications](#17-notifications)
18. [Monetisation & Paywalls](#18-monetisation--paywalls)
19. [Loading Patterns](#19-loading-patterns)
20. [Error States](#20-error-states)
21. [Empty States](#21-empty-states)
22. [Offline & Connectivity](#22-offline--connectivity)
23. [Accessibility & Localisation](#23-accessibility--localisation)
24. [Cross-Cutting Edge Cases](#24-cross-cutting-edge-cases)
25. [Technical Implementation Notes](#25-technical-implementation-notes)

---

## 1. Design Principles

| Principle | Application |
|-----------|-------------|
| **Role-aware, not role-siloed** | One account, one primary role at signup. All users can browse prices. Reporters and Vendors get extra tabs/actions on top of the shared Shopper experience. |
| **Action-first home** | Home surfaces the highest-value action per role within 1 tap. |
| **Progressive permissions** | Never request location, camera, or notifications at launch. Ask in context with a pre-permission explainer screen. |
| **Trust by default** | Every price card shows unit, freshness, and reporter badge. Ambiguity is treated as a bug. |
| **Fail loud, not silent** | No offline mode in v1, but every network failure shows actionable feedback with retry. |
| **Freemium with dignity** | Paywalls appear at the moment of value (6th list item, 4th alert), not as interruptive ads. |

---

## 2. Navigation Architecture

### 2.1 Pattern

**Bottom tab bar** (primary) + **stack navigation** (detail screens) + **modal sheets** (quick actions, filters, paywalls).

No drawer menu in v1 — all destinations reachable within 2 taps from a tab.

### 2.2 Tab Bar by Role

#### Shopper (default role)

| Tab | Icon | Route | Purpose |
|-----|------|-------|---------|
| Home | House | `/(tabs)/home` | Trending products, nearby markets |
| Search | Magnifier | `/(tabs)/search` | Product search & browse |
| My List | List | `/(tabs)/list` | Shopping list optimiser |
| Alerts | Bell | `/(tabs)/alerts` | Price drop alerts & notification inbox |
| Profile | Person | `/(tabs)/profile` | Account, favourites, settings entry |

#### Reporter (Shopper tabs + FAB)

Same 5 tabs as Shopper. A **centre FAB** (`+`) floats above the tab bar on all Reporter screens.

| FAB Action | Route |
|------------|-------|
| Submit Price | `/submit` (modal stack) |

Reporter-specific content lives inside **Profile** (submission history, badges, leaderboard link) — no extra tab to avoid clutter.

#### Vendor

| Tab | Icon | Route | Purpose |
|-----|------|-------|---------|
| Dashboard | Storefront | `/(tabs)/vendor` | Stall overview, quick stats |
| Products | Tag | `/(tabs)/vendor/products` | Manage listings |
| Analytics* | Chart | `/(tabs)/vendor/analytics` | *Pro tier only; Basic sees upsell |
| Messages† | — | — | *Not in v1 |
| Profile | Person | `/(tabs)/profile` | Shared profile tab |

Vendors retain read-only access to **Search** and **Home** via a "Browse as Shopper" link on Dashboard — opens Shopper tabs in a nested stack without switching role.

#### Admin

Admin accounts see a **6th tab** (shield icon) replacing nothing — tab bar scrolls or uses compact labels on small screens.

| Tab | Route | Purpose |
|-----|-------|---------|
| Admin | `/(tabs)/admin` | Queue, moderation, catalogue |

Admins also have full Shopper browse access via Profile → "Browse Markets".

### 2.3 Global Chrome

| Element | Rule |
|---------|------|
| Header | Stack screens: back chevron + title + max 1 trailing action (share, filter, edit) |
| Tab screens | No header back button; large title or collapsed header on scroll |
| FAB | Visible only for Reporter role; hides when keyboard open |
| Status bar | Dark content on light backgrounds; light content on map hero images |

### 2.4 Modals vs Full Screens

| Flow | Presentation |
|------|--------------|
| Submit Price | Full-screen modal stack (`/submit`) |
| Flag Price | Bottom sheet (50% height) |
| Set Price Alert | Bottom sheet |
| Filters (search/compare) | Bottom sheet |
| Premium / Vendor paywall | Full-screen modal |
| Badge level-up celebration | Full-screen modal (dismissable) |
| OTP entry | Full screen (auth stack) |
| Paystack checkout | WebView modal |

### 2.5 Deep Links

| Path | Destination |
|------|-------------|
| `lmi://product/:id` | Price comparison for product |
| `lmi://market/:id` | Market profile |
| `lmi://vendor/:id` | Public vendor profile |
| `lmi://reporter/:id` | Public reporter profile |
| `lmi://list` | Shopping list |
| `lmi://alerts` | Alerts tab |
| `lmi://admin/flags/:id` | Admin flag review (admin only) |
| `https://lmi.ng/p/:id` | Universal link → product comparison |

---

## 3. Route Map (Expo Router)

```
app/
├── _layout.tsx                    # Root: auth gate, providers
├── (auth)/
│   ├── welcome.tsx
│   ├── register.tsx
│   ├── login.tsx
│   ├── verify-otp.tsx
│   ├── forgot-password.tsx
│   ├── role-select.tsx
│   └── onboarding/
│       ├── _layout.tsx
│       ├── step-1.tsx
│       ├── step-2.tsx
│       └── step-3.tsx
├── (tabs)/
│   ├── _layout.tsx                # Role-aware tab config
│   ├── home.tsx
│   ├── search.tsx
│   ├── list.tsx
│   ├── alerts.tsx
│   ├── profile.tsx
│   ├── vendor/
│   │   ├── index.tsx              # Dashboard
│   │   ├── products.tsx
│   │   └── analytics.tsx
│   └── admin/
│       └── index.tsx
├── product/
│   └── [id].tsx                   # Price comparison
├── market/
│   └── [id].tsx                   # Market profile
├── maps/
│   └── markets.tsx                # Full-screen market map
├── submit/
│   ├── _layout.tsx
│   ├── index.tsx                  # Step 1: Market
│   ├── product.tsx                # Step 2: Product
│   ├── price.tsx                  # Step 3: Price & unit
│   └── confirm.tsx                # Step 4: Photo & submit
├── vendor/
│   ├── claim/
│   │   ├── market.tsx
│   │   ├── stall.tsx
│   │   └── status.tsx
│   ├── product/
│   │   └── [action].tsx           # add | edit
│   └── subscription.tsx
├── admin/
│   ├── flags/
│   │   ├── index.tsx              # Queue
│   │   └── [id].tsx               # Review
│   ├── users/
│   │   └── [id].tsx
│   ├── catalogue/
│   │   ├── products.tsx
│   │   └── markets.tsx
│   ├── broadcast.tsx
│   └── analytics.tsx
├── profile/
│   ├── edit.tsx
│   ├── favourites.tsx
│   ├── history.tsx                # Reporter submissions
│   ├── leaderboard.tsx
│   ├── [userId].tsx               # Public profile
│   └── subscription.tsx
├── settings/
│   ├── index.tsx
│   ├── notifications.tsx
│   ├── language.tsx
│   ├── privacy.tsx
│   └── delete-account.tsx
├── premium/
│   └── upgrade.tsx
├── notifications/
│   └── [id].tsx                   # Notification detail (fallback)
├── blocked.tsx                    # Banned/suspended account
├── maintenance.tsx
├── force-update.tsx
└── +not-found.tsx
```

---

## 4. Screen Inventory

### 4.1 Auth & Launch

| Screen | Route | Role | Entry Points | Exit Points |
|--------|-------|------|--------------|-------------|
| Splash | (native) | All | App cold start | Auth check → Welcome or Home |
| Welcome | `/(auth)/welcome` | Unauthenticated | Splash | Register, Login |
| Register | `/(auth)/register` | Unauthenticated | Welcome | Verify OTP, Role Select |
| Login | `/(auth)/login` | Unauthenticated | Welcome | Home (success), Verify OTP |
| Verify OTP | `/(auth)/verify-otp` | Unauthenticated | Register, Login (phone) | Role Select, Home |
| Forgot Password | `/(auth)/forgot-password` | Unauthenticated | Login | Login |
| Role Select | `/(auth)/role-select` | New user | Post-auth signup | Onboarding |
| Onboarding Step 1–3 | `/(auth)/onboarding/step-*` | New user | Role Select | Home / Vendor claim |
| Blocked Account | `/blocked` | Suspended | Auth check | Contact support (external) |
| Force Update | `/force-update` | All | Version check | App Store / Play Store |
| Maintenance | `/maintenance` | All | API 503 | Retry |

### 4.2 Shopper Core

| Screen | Route | Entry Points | Exit Points |
|--------|-------|--------------|-------------|
| Home | `/(tabs)/home` | Tab, post-onboarding | Search, Product, Market, Maps |
| Search | `/(tabs)/search` | Tab, Home search bar | Product, Market |
| Product Comparison | `/product/[id]` | Search, Home, Alert, Deep link | Market profile, Flag sheet, Alert sheet, Share |
| Market Profile | `/market/[id]` | Product comparison, Home, Maps | Maps directions, Vendor stalls |
| Market Map | `/maps/markets` | Home "View map", Market profile | Market profile |
| My List | `/(tabs)/list` | Tab | Product (add), Optimiser result |
| Optimiser Result | `/list/result` | My List CTA | Market profile, Premium upsell |
| Favourites | `/profile/favourites` | Profile | Product comparison |
| Alerts | `/(tabs)/alerts` | Tab, Push tap | Product comparison, Alert settings |
| Profile | `/(tabs)/profile` | Tab | Edit, Settings, Favourites, History, Leaderboard |

### 4.3 Reporter

| Screen | Route | Entry Points | Exit Points |
|--------|-------|--------------|-------------|
| Submit: Market | `/submit` | FAB | Submit: Product |
| Submit: Product | `/submit/product` | Submit flow | Submit: Price |
| Submit: Price | `/submit/price` | Submit flow | Submit: Confirm |
| Submit: Confirm | `/submit/confirm` | Submit flow | Home, Submit again |
| Submission History | `/profile/history` | Profile | Submit (update) |
| Leaderboard | `/profile/leaderboard` | Profile | Public reporter profile |
| Submission Guidelines | `/submit/guidelines` | First submit, Profile | Submit flow |

### 4.4 Vendor

| Screen | Route | Entry Points | Exit Points |
|--------|-------|--------------|-------------|
| Vendor Dashboard | `/(tabs)/vendor` | Tab, Claim approved push | Products, Claim, Subscription |
| Claim: Market | `/vendor/claim/market` | Onboarding (vendor), Dashboard | Claim: Stall |
| Claim: Stall | `/vendor/claim/stall` | Claim flow | Claim: Status |
| Claim Status | `/vendor/claim/status` | Claim submit, Push | Dashboard, Support |
| Manage Products | `/(tabs)/vendor/products` | Tab | Add/Edit product |
| Add/Edit Product | `/vendor/product/[action]` | Products tab | Products tab |
| Vendor Analytics | `/(tabs)/vendor/analytics` | Tab (Pro) | — |
| Vendor Subscription | `/vendor/subscription` | Dashboard, Settings | Paystack WebView |
| Public Vendor Profile | `/profile/[userId]` | Search, Market | — |

### 4.5 Admin

| Screen | Route | Entry Points | Exit Points |
|--------|-------|--------------|-------------|
| Admin Home | `/(tabs)/admin` | Tab, Push (flag) | Flag queue, Catalogue, Broadcast |
| Flag Queue | `/admin/flags` | Admin home | Flag review |
| Flag Review | `/admin/flags/[id]` | Queue, Push | Queue |
| User Management | `/admin/users/[id]` | Flag review | Ban confirm |
| Product Catalogue | `/admin/catalogue/products` | Admin home | Edit form |
| Market Directory | `/admin/catalogue/markets` | Admin home | Edit form |
| Broadcast | `/admin/broadcast` | Admin home | Confirm send |
| Admin Analytics | `/admin/analytics` | Admin home | — |

### 4.6 Shared / Settings

| Screen | Route | Entry Points | Exit Points |
|--------|-------|--------------|-------------|
| Edit Profile | `/profile/edit` | Profile | Profile |
| Settings | `/settings` | Profile gear | Sub-settings |
| Notification Settings | `/settings/notifications` | Settings | — |
| Language | `/settings/language` | Settings | — |
| Privacy & Data | `/settings/privacy` | Settings | Delete account |
| Delete Account | `/settings/delete-account` | Privacy | Welcome (confirmed) |
| Premium Upgrade | `/premium/upgrade` | Paywall triggers, Settings | Paystack WebView |
| Shopper Subscription | `/profile/subscription` | Settings, Profile | Paystack WebView |

---

## 5. Authentication Flow

### 5.1 Flow Diagram

```
[Splash] → Supabase session valid? ──Yes──→ [Home]
                │
                No
                ▼
           [Welcome]
           ┌────┴────┐
      [Register]  [Login]
           │          │
           ▼          ▼
    Phone/Email   Phone/Email/Google
           │          │
           ▼          ▼
      [Verify OTP] (phone only)
           │
           ▼
    New user? ──Yes──→ [Role Select] → [Onboarding] → [Home]
           │
           No (returning)
           ▼
         [Home]
```

### 5.2 Screen Specifications

#### Welcome
- **Content:** LMI logo, tagline ("Know market prices before you go"), Register CTA (primary), Login CTA (secondary), Terms & Privacy links
- **Guest browse:** Not allowed — auth required before Home
- **Minimum age:** Checkbox "I am 16 or older" on Register only

#### Register
- **Fields:** Phone number (primary, +234 default), OR toggle to Email + Password
- **Implementation:** React Hook Form + Zod (`registerSchema`); `supabase.auth.signInWithOtp` (phone) or `signUp` (email)
- **Validation:** Phone: 10–11 digits; Email: standard; Password: min 8 chars, 1 number
- **CTA:** "Continue" → sends OTP (phone) or creates account (email) → Role Select
- **Social:** "Continue with Google" via `signInWithOAuth` + Expo AuthSession — same downstream flow

#### Verify OTP
- **UI:** 6-digit input boxes, auto-advance, auto-submit on 6th digit
- **Timer:** Resend enabled after 60 seconds; max 5 attempts per session
- **SMS failure:** "Didn't get code?" → option to switch to email registration
- **Error:** Shake animation + "Code incorrect. X attempts remaining."

#### Login
- **Fields:** Phone or Email (single field, auto-detect), Password (hidden for phone → OTP flow)
- **Phone login:** Passwordless — sends OTP → Verify OTP → Home
- **Email login:** Email + Password → Home
- **Google:** OAuth → Home (existing user) or Role Select (new user)
- **Links:** Forgot password (email only), Register

#### Forgot Password
- **Field:** Email
- **Flow:** Send reset link → confirmation screen → return to Login
- **Note:** Phone-only users must contact support (linked)

#### Session Management
- **Supabase Auth** session in Expo SecureStore; auto-refresh via `supabase.auth.onAuthStateChange`
- Zustand `authStore` mirrors session, role, and profile for sync reads
- NestJS API calls include `Authorization: Bearer <supabase_access_token>`
- If refresh fails → Login with toast "Session expired. Please sign in again."
- Stay logged in indefinitely until explicit logout
- No biometric unlock in v1 (future)

#### Logout
- Profile → Settings → Logout
- Confirm dialog: "Sign out of LMI?"
- `supabase.auth.signOut()` → clears TanStack Query cache and Zustand auth state

#### Blocked / Suspended Account
- Full-screen `/blocked` on auth check if `account_status !== ACTIVE`
- Copy: reason (if provided), "Contact support@lmi.ng"
- No access to any other screen

---

## 6. Onboarding Flow

### 6.1 Sequence

```
[Role Select] → [Onboarding 1] → [Onboarding 2] → [Onboarding 3] → Role-specific landing
```

### 6.2 Role Select
- **UI:** 3 cards — Shopper, Reporter, Vendor (Admin assigned server-side, not shown)
- **Copy per card:** Icon, title, 1-line description, example use case
- **Rule:** Single primary role; cannot change without support request in v1
- **CTA:** "Continue as [Role]"

### 6.3 Walkthrough Screens

| Step | Headline | Body | Visual |
|------|----------|------|--------|
| 1 | "See prices across Lagos markets" | Compare tomato, rice, and pepper prices from Mile 12 to Balogun in seconds. | Price comparison illustration |
| 2 | "Help your community" *(Reporter)* / "Grow your stall" *(Vendor)* / "Save every week" *(Shopper)* | Role-specific 2-line value prop. | Role-specific illustration |
| 3 | "Real prices, verified by real people" | Every price shows who reported it and when it was last updated. | Trust/badge illustration |

- **Skip:** "Skip" text button top-right on all 3 screens
- **Pagination:** Dot indicators
- **Final CTA:** "Get Started"

### 6.4 Post-Onboarding Landing

| Role | Destination | Extra |
|------|-------------|-------|
| Shopper | Home | None |
| Reporter | Home + FAB tooltip ("Tap + to submit your first price") | Guidelines modal on first FAB tap |
| Vendor | Claim: Market (`/vendor/claim/market`) | Cannot skip — required for vendor value |

### 6.5 Language Picker
- Not in onboarding — available in Settings → Language
- Default: English

---

## 7. Permission Flows

### 7.1 Pattern

Every sensitive permission uses a **pre-permission explainer screen** (full-screen or bottom sheet) before the OS system dialog.

```
User action → Explainer → OS dialog → Granted/Denied handling
```

### 7.2 Location

| Trigger | Screen |
|---------|--------|
| First tap "Nearby markets" on Home | Location explainer |
| First open Market Map | Location explainer (if not already asked) |
| Shopping list optimiser (Premium distance) | Location explainer |

**Explainer copy:**  
Title: "Find markets near you"  
Body: "LMI uses your location to show the closest markets and estimate travel distance. We never track you in the background."  
CTA: "Allow Location" / "Not Now"

**Denied:**  
- Home shows markets sorted alphabetically with banner: "Enable location to see nearby markets" + "Open Settings" link  
- Map centres on Lagos Island default (6.4541, 3.3947)  
- Optimiser omits distance column; Premium upsell note shown

**Coarse location:** Treated as granted; show "~" prefix on distances

### 7.3 Camera & Photo Library

| Trigger | Permission |
|---------|------------|
| Submit Price → Add Photo → "Take Photo" | Camera |
| Submit Price → Add Photo → "Choose from Gallery" | Photo Library |
| Vendor stall photos | Same pattern |

**Explainer:** "Take a photo of the price tag or product to help shoppers trust your submission."

**Denied:** Submit without photo still allowed (photo is Should Have). Show inline note: "Photo helps your submission get trusted faster."

### 7.4 Push Notifications

| Trigger | Screen |
|---------|--------|
| First "Save" favourite | Notification explainer |
| First "Alert me" on product | Notification explainer (if not shown) |

**Explainer:**  
Title: "Get price drop alerts"  
Body: "We'll notify you when prices drop on products you care about. You can change this anytime in Settings."

**Denied:** Alerts saved locally but won't fire until enabled. Persistent subtle banner on Alerts tab.

### 7.5 Re-request Strategy
- Never auto re-prompt OS dialog
- Denied permissions: contextual banner with "Open Settings" deep link on relevant screens only

---

## 8. Shopper Journeys

### 8.1 Journey: Compare Prices

```
Home → Search (or tap trending product) → Product Comparison → Market Profile
```

#### Home Screen
**Content blocks:**
1. Greeting + area name (if location granted) or "Lagos"
2. Search bar (tappable → Search tab with keyboard focused)
3. "Nearby Markets" horizontal scroll (market cards: name, distance, product count)
4. "Trending Today" product chips (top 10 by search volume)
5. "Price Drops" section (products with >15% drop in 24h)

**Actions:** Tap product → Product Comparison; Tap market → Market Profile; "View map" → Market Map

#### Product Comparison Screen
**Content blocks:**
1. Product header (name, category, unit reference photo)
2. Sort bar: Cheapest (default) | Nearest | Freshest | Top Reporters
3. Filter button → bottom sheet (market area, max distance, updated within)
4. Price list rows: market name, price + unit, freshness badge, reporter badge + name, "Updated X ago"
5. Sticky footer: "Save ♥" | "Alert 🔔" | "Share"

**Row tap** → Market Profile scrolled to that price entry

**Premium gate:** Price history chart (7d/30d) via **React Native Gifted Charts** — padlock for free users → tap opens Premium upgrade

#### Market Profile Screen
**Content blocks:**
1. Hero image (market photo or map snapshot)
2. Name, area, opening hours, "Open now" / "Closed" badge
3. Mini map with pin (tap → full map)
4. "Get Directions" → opens Google Maps externally
5. Category tags (grains, vegetables, protein, etc.)
6. Price list for popular products in this market
7. Vendor stalls section (verified vendors with subscription badge)

### 8.2 Journey: Save Favourite & Set Alert

```
Product Comparison → [Save ♥] or [Alert 🔔]
```

**Save:** Toggle heart; toast "Saved to favourites". Free limit: 10 — 11th triggers paywall.

**Alert:** Bottom sheet:
- Threshold: "Notify me when price drops by [15% ▾]" (options: 10%, 15%, 20%, any drop)
- CTA: "Set Alert"
- Free limit: 3 active alerts — 4th triggers paywall

### 8.3 Journey: Report Incorrect Price

```
Product Comparison → long-press or "⋯" on price row → Flag sheet
```

**Flag sheet:**
- Reasons (single select): Incorrect price · Outdated · Spam
- Optional text field (140 chars)
- CTA: "Submit Report"
- Confirmation toast: "Thanks — we'll review this price"
- Anonymous to reporter; flag count not shown to shoppers

### 8.4 Journey: Share to WhatsApp

```
Product Comparison → Share → system share sheet (WhatsApp prioritized)
```

**Share payload:**
```
🍅 Tomatoes in Lagos markets
Cheapest: ₦800/kg at Mile 12 Market
Compare prices: https://lmi.ng/p/abc123
— Lagos Market Intelligence
```

---

## 9. Search Flow

### 9.1 Flow Diagram

```
[Search Tab]
    │
    ├─ Empty query → Recent + Trending + Categories
    │
    └─ Type query → Autocomplete (debounce 300ms)
                        │
                        ├─ Select product → Product Comparison
                        ├─ Select market → Market Profile
                        └─ No match → Empty results state
```

### 9.2 Search Screen States

#### Idle (no query)
- Recent searches (max 10, clear all option)
- Trending products (horizontal scroll)
- Browse by category grid (Vegetables, Grains, Protein, Spices, Oils, Fruits, Other)

#### Autocomplete (query ≥ 2 chars)
- Section 1: Products (max 5) — name, category, from ₦X
- Section 2: Markets (max 3) — name, area
- Highlight matching substring
- **Gemini assist (fallback to PostgreSQL FTS):** fuzzy alias matching ("tomatoe" → "tomato") via NestJS `GET /products/search?q=`

#### Results (on keyboard "Search" submit)
- Full product list matching query, sorted by relevance
- "Did you mean [suggestion]?" for fuzzy alias matches (e.g. "tomatoe" → "tomato")

#### Filters (bottom sheet)
- Market area (multi-select: Mile 12, Balogun, Oyingbo, etc.)
- Max distance (slider, requires location)
- Updated within (24h, 3 days, 7 days, any)
- Price range (min–max ₦)

### 9.3 Out of Scope v1
- Barcode scan
- Voice search

---

## 10. Maps & Location

### 10.1 Market Map Screen (`/maps/markets`)

**Layout:** Full-screen Google Map

**Elements:**
- Market pins (clustered when zoomed out)
- User location blue dot (if permission granted)
- Bottom card on pin tap: market name, distance, top 3 product prices, "View Market" CTA
- Search bar overlay top — filters pins by market name
- List/Map toggle button — switches to scrollable list sorted by distance

**Directions:** Market Profile → "Get Directions" → `Linking.openURL` Google Maps with lat/lng

### 10.2 Mini Map (Market Profile)
- Static 200px height, non-interactive preview
- Tap → full Market Map centred on this market

### 10.3 No In-App Navigation
Turn-by-turn directions are out of scope — external Google Maps only.

---

## 11. Shopping List Optimiser

### 11.1 Flow

```
My List → Add products → "Find Cheapest Market" → Result
```

### 11.2 My List Screen

**Content:**
- Product rows: name, unit assumption (1 unit), swipe-to-delete
- "Add item" → Search overlay (product search, tap to add)
- "Add from favourites" shortcut
- Footer CTA: "Find Cheapest Market" (disabled if list empty)

**Free tier:** Max 5 items. Adding 6th → paywall modal.

### 11.3 Optimiser Result Screen

**Content:**
1. Summary: "Best market for your list: **[Market Name]** — est. ₦X,XXX"
2. Ranked list of markets: market name, total est. cost, item coverage (e.g. "8/10 items found")
3. Expandable row per market: per-item price breakdown; "N/A" for missing items
4. **Premium only:** Savings vs most expensive market; travel distance from user
5. CTA: "View Market" on recommended market

**Calculation loading:** Full-screen overlay, max 3 seconds: "Finding the best deals across Lagos markets…"

**Free tier:** Optimiser works for ≤5 items. Premium: unlimited items + savings + distance.

### 11.4 Multi-Market Trip
Out of scope v1. App optimises for **single market** that minimises total spend (per PRD).

---

## 12. Price Submission Flow (Reporter)

### 12.1 Flow Diagram

```
[FAB +] → Guidelines (first time only) → Market → Product → Price & Unit → Photo → Confirm → Success
```

### 12.2 Step 1: Select Market (`/submit`)

**UI:**
- Search bar
- "Recent markets" (last 5 submitted)
- "Near me" section (location required)
- Full market list A–Z

**Validation:** Market required to proceed

### 12.3 Step 2: Select Product (`/submit/product`)

**UI:**
- Search catalogue (autocomplete)
- Category browse chips
- Recent products (this reporter)

**No "add new product" in v1** — reporters must pick from catalogue. Empty search shows "Can't find product? Contact support" link.

### 12.4 Step 3: Price & Unit (`/submit/price`)

**UI:**
- Large numeric price input (₦ prefix, no decimals)
- Unit selector: kg · piece · bunch · litre · crate · bag
- Reference: "Current average at this market: ₦X/unit" (if data exists)
- Last submission by this reporter (if any) with "Update" pre-fill shortcut

**Validation:**
- Price > 0 and < ₦1,000,000
- Unit required

**Outlier guard (>50% from 7-day market average):**
- Warning banner: "This price looks unusual. Are you sure?"
- Reporter can override and submit — submission auto-flagged for admin review (not blocked)

**Duplicate guard (same reporter + product + market within 30 min):**
- Block submit: "You already submitted this price recently. Try again in X minutes."

### 12.5 Step 4: Photo & Confirm (`/submit/confirm`)

**UI:**
- Summary card: market, product, price, unit
- Photo area: "Add photo" (camera/gallery) — optional
- Guidelines reminder: "Make sure price tag is visible"
- CTA: "Submit Price"

**Upload:** **Expo Image Picker** → client compress (max 5MB) → **Supabase Storage** `submissions/` bucket. Progress bar on upload. Form validated with React Hook Form + Zod (`submitPriceSchema`).

**Upload failure:** Retry button + "Submit without photo" option

### 12.6 Success Screen

**UI:**
- Checkmark animation
- "Price submitted!"
- Badge progress: "42 / 50 submissions to Silver" progress bar
- Streak: "🔥 5-day submission streak" (if applicable)
- CTAs: "Submit Another" (→ Step 1) | "Done" (→ Home)

### 12.7 Update Existing Price

From Submission History → tap entry → "Update Price" → pre-filled flow from Step 3

Reporter cannot delete own submissions in v1 — only update or admin removal.

### 12.8 Submission Guidelines (`/submit/guidelines`)

Shown as modal on first FAB tap. Accessible from Profile → "Submission guidelines".

**Content:** 5 bullet rules (accurate prices, clear photos, no spam, one submission per product per visit, consequences for abuse). Checkbox "I understand" → CTA "Start Submitting".

---

## 13. Vendor Journeys

### 13.1 Journey: Claim a Stall

```
Onboarding (vendor) → Select Market → Stall Details → Submit → Pending Status
```

#### Claim: Market
- Search + browse markets
- CTA: "Continue"

#### Claim: Stall
**Fields:**
| Field | Required |
|-------|----------|
| Stall name | Yes |
| Product categories (multi-select) | Yes |
| Description (max 300 chars) | Yes |
| Stall photos (1–5) | No (Should Have) |
| Stall location hint (e.g. "Row B, Stall 14") | Yes |

- Toggle: "My stall isn't listed" → creates new stall entry pending admin verification
- CTA: "Submit Claim"

#### Claim Status (`/vendor/claim/status`)
**States:**
| State | UI |
|-------|-----|
| Pending | Clock icon, "We're reviewing your claim", "Usually within 48 hours" |
| Approved | Checkmark, "You're live!", CTA → Dashboard |
| Rejected | X icon, reason text, CTA "Edit & Resubmit" or "Contact Support" |

**While pending:** Dashboard shows read-only preview of stall profile. Cannot publish products.

### 13.2 Journey: Manage Products

```
Vendor Dashboard → Products tab → Add Product
```

**Add/Edit Product form:**
| Field | Required |
|-------|----------|
| Product (catalogue search) | Yes |
| Price | Yes |
| Unit | Yes |
| Available today (toggle) | Yes |
| Photo | No |

**Publish:** Instant live — same trust rules as Reporter submissions (flaggable).

### 13.3 Vendor Dashboard

**Content:**
1. Stall name + verification badge
2. Subscription tier badge (Basic / Pro)
3. Quick stats: profile views (7d), product clicks (7d) — Pro only; Basic sees blurred + upsell
4. "Add Product" CTA
5. "Manage Subscription" link
6. "Browse as Shopper" link

### 13.4 Vendor Subscription

**Tiers:**
| | Basic ₦5,000/mo | Pro ₦12,000/mo |
|---|-----------------|----------------|
| Stall claim + listings | ✓ | ✓ |
| Public profile | ✓ | ✓ |
| Promoted search placement | — | ✓ |
| Analytics dashboard | — | ✓ |
| Publish promotions | — | ✓ (Could Have — hidden if not built) |

**Flow:** Plan cards → Paystack WebView → success → Dashboard updated

**One stall per vendor account in v1.**

### 13.5 Respond to Reviews
Should Have — if built: Dashboard → Reviews section → reply per review (max 300 chars). If not in build scope, hide entirely.

---

## 14. Admin Journeys

### 14.1 Journey: Handle Flagged Price

```
Push notification → Admin tab → Flag Queue → Flag Review → Action → Queue
```

#### Admin Home
**Content:**
1. Summary cards: Pending flags (count), Pending claims (count), Active users (7d)
2. Quick links: Flag Queue, Claims Queue, Catalogue, Broadcast, Analytics
3. Recent activity feed (last 10 admin actions)

#### Flag Queue
- Sorted oldest first
- Row: product, market, price, flag count, reporter name, time flagged
- Filter: by market, by product, by flag count

#### Flag Review (`/admin/flags/[id]`)
**Content:**
1. Submission detail: product, market, price, unit, photo, submitted at
2. Reporter card: name, badge, submission count, recent flags
3. Flag details: reasons breakdown, user comments
4. Price context: 7-day average, other current prices at market
5. **Actions (single screen, confirm for destructive):**
   - **Confirm** — keep live, clear flags
   - **Edit** — inline price edit → save
   - **Remove** — delist price
   - **Warn Reporter** — sends in-app warning + push
   - **Ban Reporter** — confirm dialog → account suspended

All actions logged with admin ID + timestamp.

### 14.2 Journey: Verify Reporter

From Flag Review → Reporter card → User Management screen
- Toggle: Verified Reporter status
- View submission history
- Issue warning / suspend / ban

### 14.3 Catalogue Management

**Products:** Searchable list → Add/Edit/Delete form (name, category, units, aliases, photo)

**Markets:** Searchable list → Add/Edit/Delete form (name, area, lat/lng, hours, photo)

### 14.4 Broadcast Notification

**UI:**
- Title (max 60 chars)
- Body (max 200 chars)
- Audience: All users | Shoppers | Reporters | Vendors
- Preview card
- CTA: "Send" → confirm dialog → success toast

### 14.5 CSV Export
Could Have — Admin Analytics → "Export" button → generates CSV → share sheet (download/email). If not built, omit.

---

## 15. Profile & Public Profiles

### 15.1 Own Profile (`/(tabs)/profile`)

**Layout varies by role:**

| Section | Shopper | Reporter | Vendor | Admin |
|---------|---------|----------|--------|-------|
| Avatar + name | ✓ | ✓ | ✓ | ✓ |
| Role badge | ✓ | ✓ + Reporter badge tier | ✓ + Vendor verified | ✓ + Admin |
| Edit profile | ✓ | ✓ | ✓ | ✓ |
| Favourites | ✓ | ✓ | — | ✓ |
| My alerts | ✓ | ✓ | — | ✓ |
| Submission history | — | ✓ | — | — |
| Leaderboard link | — | ✓ | — | — |
| Badge progress | — | ✓ | — | — |
| Stall link | — | — | ✓ | — |
| Subscription status | Premium badge | — | Vendor tier | — |
| Browse as Shopper | — | — | ✓ | ✓ |
| Settings gear | ✓ | ✓ | ✓ | ✓ |

### 15.2 Edit Profile

**Fields:** Display name (required), profile photo (optional, Could Have), phone (read-only), email (editable), bio (max 160 chars, Reporter/Vendor only)

### 15.3 Public Reporter Profile (`/profile/[userId]`)

**Visible:** Display name, badge tier, total submissions, member since, weekly leaderboard rank, recent submissions (last 10, product + market + date — no edit actions)

**Hidden:** Phone, email

### 15.4 Public Vendor Profile

**Visible:** Stall name, market, photos, description, product listings with prices, subscription verified badge, member since

---

## 16. Settings

### 16.1 Settings Home (`/settings`)

| Section | Items |
|---------|-------|
| Account | Edit profile, Change password (email users), Subscription |
| Preferences | Notifications, Language (English / Pidgin), Theme (Light / System) |
| Privacy | Privacy policy, Terms, Export my data, Delete account |
| Support | Help centre (FAQ webview), Contact support, App version |
| Session | Logout |

### 16.2 Notification Settings

| Toggle | Default |
|--------|---------|
| Push notifications (master) | On |
| Price drop alerts | On |
| Significant price changes (>15%) | On |
| Weekly shopping summary (Premium) | On |
| Badge & streak updates (Reporter) | On |
| Account warnings | On (not disableable) |
| Marketing & tips | Off |

### 16.3 Language
- English (default)
- Nigerian Pidgin — key UI strings only in v1 (navigation, CTAs, onboarding, errors); product names remain English

### 16.4 Delete Account
1. Settings → Privacy → Delete account
2. Warning screen: what will be deleted
3. Confirm: type "DELETE" + OTP verification
4. 7-day grace period (soft delete) — login within 7 days cancels deletion
5. After 7 days: permanent removal

### 16.5 Theme
- Light (default) · System (follows OS)
- Dark mode: not in v1

---

## 17. Notifications

### 17.1 Delivery Channels

| Trigger | Channel | Deep Link Destination |
|---------|---------|----------------------|
| Price drop >15% on saved item | Push | Product Comparison |
| New price on favourited product (Premium) | Push | Product Comparison |
| Weekly cheapest market summary (Premium) | Push | `/list/result` (digest view) |
| Submission flagged 3+ times | Push (Admin) | Flag Review |
| Badge level-up | Push + In-app | Badge celebration modal |
| Stall claim approved/rejected | Push (Vendor) | Claim Status |
| Subscription renewal reminder | Push + Email | Subscription screen |
| Account warning | Push + In-app | Modal on next app open |
| Admin broadcast | Push | Home |

### 17.2 In-App Notification Inbox (Alerts Tab)

**Two sections:**
1. **Alerts** — active price alerts with threshold, product name, current price, toggle on/off
2. **Activity** — chronological inbox of push notifications (last 30 days)

Unread dot on Alerts tab badge. Tap item → deep link destination.

### 17.3 Badge Level-Up Celebration

Full-screen modal:
- Badge animation (Bronze → Silver → Gold → Elite)
- "You earned [Badge]!"
- Subtitle: perk description from PRD
- CTA: "Continue"

Respects reduced motion: static image instead of animation.

---

## 18. Monetisation & Paywalls

### 18.1 Paywall Triggers

| Trigger | Screen |
|---------|--------|
| 6th shopping list item | `/premium/upgrade` modal |
| 4th price alert | `/premium/upgrade` modal |
| 11th favourite | `/premium/upgrade` modal |
| Tap locked price history chart | `/premium/upgrade` modal |
| Tap locked optimiser savings/distance | `/premium/upgrade` modal |
| Vendor Analytics tab (Basic tier) | `/vendor/subscription` |
| Settings → Subscription | `/profile/subscription` or `/vendor/subscription` |

### 18.2 Premium Upgrade Screen

**Content:**
- Headline: "Save more with LMI Premium"
- Feature comparison table (Free vs Premium) — matches PRD §7.2
- Plan cards: ₦1,500/month · ₦12,000/year (highlight "Save 33%")
- CTA: "Subscribe" → Paystack WebView
- Restore purchases link
- No free trial in v1

### 18.3 Payment Flow

```
Plan select → Paystack WebView → Success/Fail
```

**Success:** Confetti toast, dismiss paywall, unlock feature immediately

**Failure:** Inline error with retry + "Pay via bank transfer" link (Paystack fallback). Copy: "Payment didn't go through. Please try again or use bank transfer."

### 18.4 Subscription Management
- Settings → Subscription: current plan, renewal date, cancel/upgrade
- Cancel: confirm dialog → access until period end

---

## 19. Loading Patterns

| Context | Pattern |
|---------|---------|
| App cold start | Native splash (brand colour + logo) → auth check skeleton (< 2s) |
| Tab screen first load | Skeleton cards (3 placeholder rows) |
| Search autocomplete | Inline spinner in search bar |
| Product comparison | Skeleton price rows |
| Pull-to-refresh | All list screens: Home, Search results, Product comparison, Alerts, Leaderboard, Admin queue |
| Pagination | Infinite scroll with footer spinner (price lists, submission history) |
| Images | Progressive: grey placeholder → fade in (Supabase Storage transform URL) |
| Optimiser calculation | Full-screen loading with message (max 3s) |
| Form submit | Button loading spinner, disabled inputs |
| Paystack | WebView loading bar |

**No full-screen blocking spinners** except optimiser and initial auth check.

---

## 20. Error States

| Error | UI | Recovery |
|-------|-----|----------|
| No network | Top banner (persistent, red): "No internet connection" | Auto-dismiss when online; retry on action |
| API timeout | Toast: "Request timed out" | Retry button on screen |
| 500 server error | Inline error card: "Something went wrong" | "Try Again" button |
| 401 session expired | Redirect to Login | Toast: "Session expired" |
| 403 forbidden | Toast: context message | Back navigation |
| 429 rate limit | Toast: "Too many attempts. Try again in X minutes." | Countdown |
| Search no results | Empty state (see §21) | Suggestions |
| Payment failed | Inline on WebView close | Retry + bank transfer |
| Image upload failed | Inline on submit screen | Retry / skip photo |
| OTP expired | Inline error on Verify screen | Resend code |
| Account banned | Full-screen `/blocked` | Contact support |
| API maintenance | Full-screen `/maintenance` | "Retry" button |
| Force update | Full-screen `/force-update` | Store link (non-dismissable) |

---

## 21. Empty States

| Screen | Illustration | Copy | CTA |
|--------|-------------|------|-----|
| Home (no trending data) | Market stall sketch | "Prices are being added. Check back soon." | "Explore markets" |
| Home (no location) | Map pin | "See markets near you" | "Enable location" |
| Search (no history) | — | Trending + categories shown (not empty) | — |
| Search (no results) | Magnifier | "No results for '[query]'" | "Try [suggestion]" or "Browse categories" |
| Favourites | Heart outline | "No saved products yet" | "Search products" |
| My List | Shopping basket | "Build your shopping list to find the cheapest market" | "Add first item" |
| Alerts (no alerts) | Bell | "Get notified when prices drop" | "Search products" |
| Activity inbox | Inbox | "No notifications yet" | — |
| Submission history | Receipt | "No submissions yet" | "Submit a price" (+ FAB hint) |
| Leaderboard (early launch) | Trophy | "Be the first top reporter this week" | "Submit a price" |
| Vendor products | Tag | "Add your first product listing" | "Add product" |
| Admin flag queue | Checkmark | "All caught up — no flagged prices" | — |
| Product comparison (no prices) | Price tag | "No prices yet for this product in Lagos" | Reporter: "Submit price" / Shopper: "Set alert for first price" |
| Market profile (no prices) | Stall | "Prices coming soon to this market" | Reporter: "Submit price" |

---

## 22. Offline & Connectivity

### 22.1 v1 Scope (per PRD)

**No offline read/write mode.** App requires network for all data.

### 22.2 Graceful Degradation

| Behaviour | Detail |
|-----------|--------|
| Network loss mid-session | Persistent top banner; cached **TanStack Query** data remains visible with "Last updated X ago" — not refreshed |
| Action while offline | Toast: "You're offline. Check your connection." — action blocked |
| Queue failed requests | Out of scope v1 — no offline submission queue |
| Client cache | TanStack Query cache (5 min `staleTime` for prices) for faster re-open — not offline mode |

### 22.3 Future (documented, not built)
- Offline browse of cached prices with staleness warnings
- Queue reporter submissions for sync

---

## 23. Accessibility & Localisation

### 23.1 Accessibility (WCAG 2.1 AA)
- Minimum touch target: 44 × 44 pt
- Contrast ratio: 4.5:1 body text
- All images: `accessibilityLabel` alt text
- Screen reader: tested on VoiceOver + TalkBack
- Dynamic type: supported on body text; headings capped at 1.3×
- Reduced motion: disable badge animations and onboarding transitions

### 23.2 Currency & Units
- Format: `₦1,850` (comma thousands separator, no decimals)
- Always show unit: `₦850 / kg`

### 23.3 Pidgin (Should Have)
Partial translation: tab labels, onboarding, CTAs, error messages, empty states. Product/market names stay English.

Example: "Find Cheapest Market" → "Find Cheapest Market" (kept) / "Check price dem" (search placeholder)

---

## 24. Cross-Cutting Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Guest browse | Not allowed — Welcome screen on launch |
| Multi-device login | Allowed — Expo push token re-registered per device via `POST /devices/token` |
| Reporter warning from admin | Modal on next app open (non-dismissable until acknowledged) + push |
| Role change request | Profile → Settings → "Request role change" → support email (no in-app switch) |
| Multiple stalls | One per vendor account in v1 |
| Reporter also shops | Full Shopper features available on same account |
| Admin also shops | "Browse Markets" in Profile |
| App backgrounded during submit | React Hook Form state preserved in memory (not persisted to storage) |
| Version force-update | API returns `X-Min-Version` header → `/force-update` screen |
| Stale price display | Freshness badges: Green (<24h), Amber (24–72h), Red (>72h) + "May be outdated" |
| Price with 3+ flags | Still visible to shoppers until admin removes; subtle "Under review" badge |

---

## 25. Technical Implementation Notes

> Full stack reference: see `TECH_STACK.md`. This section maps product flows to implementation.

### 25.1 Stack Summary

| Layer | Technology |
|-------|------------|
| Mobile | React Native 0.82 · Expo SDK 55 · TypeScript |
| Navigation | Expo Router |
| Server state | TanStack Query |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| Charts | React Native Gifted Charts |
| Images | Expo Image Picker → Supabase Storage |
| Maps | Google Maps |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| API | NestJS on Render |
| Payments | Paystack |
| Push | Expo Push Notifications |
| AI | Google Gemini API (via NestJS proxy) |

### 25.2 Data Access Pattern

| Data type | Source | Client access |
|-----------|--------|---------------|
| Auth session | Supabase Auth | `@supabase/supabase-js` + SecureStore |
| Prices, markets, search | NestJS REST | TanStack Query `useQuery` / `useMutation` |
| Real-time flags (admin) | Supabase Realtime (optional) | Subscribe on admin queue screen |
| Images | Supabase Storage | Public URLs in API responses |
| Subscriptions | NestJS + Paystack webhook | TanStack Query + Zustand `subscriptionStore` |

### 25.3 Key Zod Schemas (shared `packages/shared`)

| Schema | Used on |
|--------|---------|
| `registerSchema` | Register, Verify OTP |
| `loginSchema` | Login |
| `submitPriceSchema` | Price submission steps |
| `stallClaimSchema` | Vendor claim |
| `vendorProductSchema` | Vendor product add/edit |
| `alertSchema` | Set price alert sheet |
| `flagPriceSchema` | Flag price sheet |
| `profileSchema` | Edit profile |

### 25.4 TanStack Query Keys

```
['markets']                          ['markets', marketId]
['products', 'search', query]        ['products', productId]
['prices', { productId, filters }]   ['prices', priceId]
['favourites']                       ['alerts']
['list', listId]                     ['leaderboard', period]
['submissions', 'mine']              ['vendor', 'dashboard']
['admin', 'flags']                   ['admin', 'analytics']
```

### 25.5 Zustand Stores

| Store | State |
|-------|-------|
| `authStore` | session, user, role, isLoading |
| `onboardingStore` | walkthroughComplete, guidelinesAccepted |
| `preferencesStore` | language, theme, notificationPrefs |
| `subscriptionStore` | tier, expiry, isPremium |

### 25.6 Screen → Form / Chart Mapping

| Screen | RHF + Zod | Gifted Charts |
|--------|-----------|---------------|
| Register / Login | ✓ | — |
| Submit Price (all steps) | ✓ | — |
| Vendor Claim / Product | ✓ | — |
| Set Alert sheet | ✓ | — |
| Flag Price sheet | ✓ | — |
| Edit Profile | ✓ | — |
| Product Comparison | — | Price history (Premium) |
| Vendor Analytics (Pro) | — | Views, clicks |
| Admin Analytics | — | MAU, submissions |

### 25.7 Gemini API Touchpoints

| Screen / Flow | Gemini role |
|---------------|-------------|
| Search autocomplete | Fuzzy match + alias expansion |
| Search no results | "Did you mean…" suggestions |
| Submit Price (photo) | Suggest product from price-tag photo (Could Have) |
| Outlier warning | Plain-language explanation on submit |
| Admin Flag Review | Summary card: context + recommendation |
| Premium weekly digest | Narrative shopping summary in push + in-app |
| Pidgin localisation | Batch UI string translation (Could Have) |

All Gemini calls: `POST /api/v1/ai/*` on NestJS — never direct from mobile.

### 25.8 Push Notification Pipeline

```
Event (NestJS) → notifications table → Expo Push API → device
                      ↑
              ExpoPushToken registered
              on login via POST /devices/token
```

### 25.9 Paystack Integration

| Step | Implementation |
|------|----------------|
| Initiate | NestJS `POST /subscriptions/initialize` → checkout URL |
| Checkout | `expo-web-browser` or WebView modal |
| Confirm | Paystack webhook → NestJS updates `subscriptions` |
| App refresh | TanStack Query invalidates `['subscription']` |

### 25.10 NestJS Modules ↔ App Screens

| NestJS Module | Primary screens |
|---------------|-----------------|
| `AuthModule` | Welcome, Register, Login, Verify OTP |
| `ProductsModule` | Search, Product Comparison |
| `PricesModule` | Comparison, Submit Price, Flag |
| `MarketsModule` | Home, Market Profile, Maps |
| `AlertsModule` | Alerts tab, notification deep links |
| `VendorsModule` | Vendor Dashboard, Claim, Products |
| `PaymentsModule` | Premium Upgrade, Subscription |
| `AdminModule` | Admin tab, Flag Review, Catalogue |
| `AiModule` | Search, Digest, Admin Review assist |
| `NotificationsModule` | All push-triggered destinations |

---

## Appendix A: Screen Count Summary

| Area | Screens |
|------|---------|
| Auth & Launch | 12 |
| Shopper | 10 |
| Reporter | 7 |
| Vendor | 9 |
| Admin | 8 |
| Shared (Profile, Settings, Premium) | 12 |
| System (Blocked, Maintenance, Force Update, 404) | 4 |
| **Total** | **~62 screens** |

---

## Appendix B: Freshness & Trust UI Spec

### Price Card Row Anatomy
```
┌─────────────────────────────────────────────┐
│ Mile 12 Market                    ₦800 / kg │
│ 🟢 Updated 3h ago                           │
│ 🥈 Chukwuemeka · Silver Reporter            │
└─────────────────────────────────────────────┘
```

### Freshness Thresholds
| Age | Badge | Colour |
|-----|-------|--------|
| < 24 hours | "Updated Xh ago" | Green |
| 24–72 hours | "Updated Xd ago" | Amber |
| > 72 hours | "May be outdated" | Red |

---

## Appendix C: Freemium Limits Quick Reference

| Feature | Free | Premium |
|---------|------|---------|
| Shopping list items | 5 | Unlimited |
| Price alerts | 3 | Unlimited |
| Favourites | 10 | Unlimited |
| Price history chart | ✗ | ✓ |
| Optimiser savings + distance | ✗ | ✓ |
| Weekly digest | ✗ | ✓ |
| Ads | Yes (banner on Home) | Ad-free |

---

*CONFIDENTIAL — FOR INTERNAL USE ONLY*  
*Lagos Market Intelligence · App Flow Document v1.1*
