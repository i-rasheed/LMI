# Lagos Market Intelligence
## Product Requirements Document

**Version 1.0 · Confidential**  
**Prepared:** June 2026  

*CONFIDENTIAL — FOR INTERNAL USE ONLY*

---

## 1. Executive Summary

Lagos Market Intelligence (LMI) is a cross-platform mobile application built with React Native (Expo) that solves a fundamental problem for millions of Lagos residents: the inability to compare food and grocery prices across markets without physically visiting them.

Lagos hosts over 20 million residents who spend a disproportionate share of their income on food. Price opacity across the city's hundreds of markets means shoppers consistently overpay, small-scale businesses struggle to source competitively, and market inefficiency persists. LMI introduces price transparency at scale.

### 1.1 Product Vision

> "To become the definitive price intelligence layer for Lagos markets — empowering every shopper, reporter, and vendor with real-time, crowd-verified grocery price data."

### 1.2 Core Value Propositions

- Shoppers discover the cheapest market for their shopping list in seconds
- Market Reporters earn recognition and badges for contributing verified prices
- Vendors reach price-conscious shoppers and publish their availability
- Administrators maintain data quality through lightweight moderation tools
- The platform generates revenue through premium shopper features and vendor subscriptions

---

## 2. Problem Statement

### 2.1 The Core Problem

Lagos market prices are volatile, opaque, and geographically fragmented. A kilogram of tomatoes can vary by 40–80% between Mile 12 and Balogun market on the same day. Shoppers have no reliable, real-time way to discover these differences without spending hours and transport money physically comparing markets.

### 2.2 Who Suffers

| Persona | Pain Point |
|---------|------------|
| Low-income shopper | Overpays daily due to lack of price information; transport costs make comparison shopping expensive |
| Middle-class household | No trusted digital source for Lagos market prices; relies on word of mouth |
| Restaurant/business buyer | Cannot efficiently source the best bulk price across multiple markets |
| Market Reporter | No formal recognition or platform for their price knowledge |
| Vendor | No digital presence to attract price-sensitive shoppers |

### 2.3 Why Existing Solutions Fail

- Social media price posts are unverified, inconsistent, and not searchable
- General e-commerce apps (Jumia, Jiji) do not reflect physical market prices
- No existing app covers the breadth of Lagos open markets with real-time data

---

## 3. Goals & Success Metrics

### 3.1 Business Goals

- Achieve product-market fit within 6 months of launch
- Generate sustainable revenue through vendor subscriptions and premium features by Month 9
- Establish LMI as the most trusted food price source in Lagos within 12 months

### 3.2 Key Performance Indicators

| Metric | Target (12 months) |
|--------|-------------------|
| Monthly Active Users (MAU) | 50,000+ |
| Price submissions per day | 500+ |
| Markets covered | All major Lagos markets (50+) |
| Vendor subscribers | 200+ paying vendors |
| Premium shopper subscribers | 2,000+ |
| Price data freshness | 70% of products updated within 24 hours |
| Reporter retention (30-day) | 40%+ |
| App Store rating | 4.3+ (both stores) |
| Price accuracy reported by users | 85%+ |

---

## 4. User Personas

### 4.1 The Shopper

| Attribute | Detail |
|-----------|--------|
| Name | Amaka, 34 |
| Occupation | Nurse, Surulere |
| Device | Tecno Camon Android |
| Language | English + Pidgin |
| Goal | Spend less on weekly market run without wasting time |
| Frustration | Prices change weekly and she never knows which market is cheapest |
| Tech comfort | Uses WhatsApp, Instagram, and OPay daily |

### 4.2 The Market Reporter

| Attribute | Detail |
|-----------|--------|
| Name | Chukwuemeka, 27 |
| Occupation | Freelance, visits Mile 12 daily |
| Goal | Earn recognition, build reputation as a trusted market source |
| Motivation | Badges and leaderboard status; social proof in his community |
| Behaviour | Submits 5–10 price updates per market visit with photos |

### 4.3 The Vendor

| Attribute | Detail |
|-----------|--------|
| Name | Mama Ngozi, 48 |
| Occupation | Tomato & pepper seller, Oyingbo Market |
| Goal | Attract more customers, especially those who plan their shopping online |
| Frustration | No digital presence; loses customers to stalls they find online |
| Tech comfort | Assisted by her daughter to set up; low digital literacy |

### 4.4 The Administrator

| Attribute | Detail |
|-----------|--------|
| Name | Tunde, LMI Operations Team |
| Goal | Maintain data quality, verify reporters, manage abuse reports |
| Tools needed | Dashboard inside mobile app, filterable submission queue, ban controls |
| Volume | 2–5 admins at launch |

---

## 5. Feature Requirements

Features are prioritised using MoSCoW: **Must Have (M)**, **Should Have (S)**, **Could Have (C)**, **Won't Have for v1 (W)**.

### 5.1 Authentication & Onboarding

| Feature | Priority |
|---------|----------|
| Phone number + OTP registration | M |
| Email + password registration | M |
| Social login (Google) | S |
| Role selection at signup (Shopper / Reporter / Vendor) | M |
| Onboarding walkthrough (3 screens) | M |
| Pidgin English language toggle | S |
| Profile photo upload | C |

### 5.2 Shopper Features

| Feature | Priority |
|---------|----------|
| Product search with autocomplete | M |
| Price comparison across markets | M |
| Cheapest market for a shopping list | M |
| Price history chart (7-day, 30-day) | S |
| Save favourite products | M |
| Price drop alerts (push notification) | M |
| Significant price change alerts (>15% threshold) | M |
| Report incorrect price | M |
| Nearest market discovery via GPS | M |
| Market profile pages (location, hours, categories) | S |
| Premium: price trend forecasting | S |
| Premium: weekly smart shopping summary | S |
| Premium: ad-free experience | S |
| Share price to WhatsApp | C |

### 5.3 Market Reporter Features

| Feature | Priority |
|---------|----------|
| Submit new price with market + product + unit | M |
| Update an existing price | M |
| Upload photo evidence | S |
| View personal submission history | M |
| Badge display on profile (Bronze → Silver → Gold → Elite) | M |
| Submission streak tracker | S |
| Leaderboard (top reporters this week/month) | S |
| Reporter profile page (public) | C |
| In-app submission guidelines | M |

### 5.4 Vendor Features

| Feature | Priority |
|---------|----------|
| Claim stall/shop in a market | M |
| Publish product availability & price | M |
| Upload stall photos | S |
| Respond to shopper reviews | S |
| Vendor profile page (public) | M |
| Subscription management (in-app) | M |
| Promoted listing in search results (paid) | S |
| Analytics: profile views, product clicks | S |
| Publish promotions/discounts | C |

### 5.5 Administrator Features

| Feature | Priority |
|---------|----------|
| Admin dashboard (inside mobile app) | M |
| View all pending flagged submissions | M |
| Approve / reject / edit flagged price | M |
| Verify or revoke Reporter status | M |
| Ban / suspend user accounts | M |
| Manage product catalogue (add/edit/delete) | M |
| Manage market directory (add/edit/delete) | M |
| Review and resolve abuse reports | M |
| Analytics dashboard (MAU, submissions, top markets) | S |
| Push broadcast notifications to all users | S |
| Export data as CSV | C |

---

## 6. Key User Flows

### 6.1 Shopper — Compare Prices

1. Open app → Home screen shows trending products and nearby markets
2. Tap search bar → Type product name (e.g. "tomatoes") → Autocomplete suggests matches
3. Select product → Price comparison screen shows all markets with current prices, sorted cheapest first
4. Tap a market → See market profile, stall details, last updated time, Reporter name
5. Tap "Save" to add to favourites or "Alert me" to set a price drop notification

### 6.2 Shopper — Shopping List Optimiser

1. Tap "My List" → Add multiple products
2. Tap "Find Cheapest Market" → App calculates which single market minimises total spend
3. Result shows total estimated cost per market, ranked
4. Premium users see savings breakdown and travel distance

### 6.3 Reporter — Submit a Price

1. Tap "+" button → Submit Price screen
2. Select market → Select or search product → Enter price and unit (per kg, per piece, per bunch)
3. Optional: attach photo
4. Submit → Confirmation shows badge progress
5. Submission goes live instantly; flagging available to shoppers

### 6.4 Vendor — Claim a Stall

1. Vendor registers and selects "Vendor" role
2. Search for their market → Search for their stall or create new
3. Fill stall details: name, product categories, description, photos
4. Submit claim → Admin reviews and approves or rejects within 48 hours
5. Once approved, vendor can publish products and manage their profile

### 6.5 Admin — Handle a Flagged Price

1. Admin receives push notification of new flag
2. Opens Admin dashboard → Flagged Submissions queue
3. Reviews submission: price, photo, market, Reporter history
4. Options: Confirm (keep live), Edit (correct price), Remove, Warn Reporter, Ban Reporter
5. Action logged with timestamp and admin ID

---

## 7. Monetisation Model

### 7.1 Revenue Streams

| Stream | Description |
|--------|-------------|
| Shopper Premium (Freemium) | Monthly/annual subscription unlocking price trend forecasting, smart shopping summaries, and ad-free experience. Estimated ₦1,500/month or ₦12,000/year. |
| Vendor Basic Subscription | Stall claim + product listings + profile page. Estimated ₦5,000/month per stall. |
| Vendor Pro Subscription | Everything in Basic + promoted search placement + analytics dashboard + discount publishing. Estimated ₦12,000/month. |
| Data Licensing (future) | Aggregated, anonymised price trend data licensed to FMCG companies, NGOs, and government agencies. |

### 7.2 Freemium Boundary

| Free Features | Premium Features |
|---------------|------------------|
| Product search and price comparison | Price trend forecasting |
| Cheapest market for up to 5 items | Unlimited shopping list optimisation |
| 3 price drop alerts | Unlimited price alerts |
| Basic market profiles | Weekly smart shopping digest (push) |
| Favourites (up to 10 items) | Unlimited favourites |
| | Ad-free experience |

---

## 8. Technical Architecture

### 8.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Mobile app | React Native with Expo (managed workflow) |
| Navigation | Expo Router (file-based routing) |
| State management | Zustand + React Query (TanStack Query) |
| Backend framework | Node.js with Express or Fastify |
| Database | PostgreSQL (primary relational store) |
| Cache layer | Redis (price data caching, session management) |
| File storage | Cloudinary (product & stall photos) |
| Push notifications | Expo Push Notifications + Firebase FCM |
| Authentication | JWT + refresh tokens; phone OTP via Termii or Twilio |
| Payments | Paystack (Nigerian-native, supports cards + bank transfer) |
| Maps & location | Google Maps SDK for Expo |
| Hosting | Railway or Render (API); Supabase optional for real-time |
| CI/CD | GitHub Actions + Expo EAS Build |

### 8.2 Core Data Models

**Users**
- id, phone, email, role (SHOPPER | REPORTER | VENDOR | ADMIN), language_preference, created_at

**Markets**
- id, name, area (e.g. Mile 12, Balogun), latitude, longitude, opening_hours, photo_url

**Products**
- id, name, category, unit_options (kg | piece | bunch | litre), photo_url, aliases (for search)

**PriceSubmissions**
- id, product_id, market_id, reporter_id, price, unit, photo_url, submitted_at, is_flagged, flag_count

**Vendors**
- id, user_id, market_id, stall_name, description, photos[], subscription_tier, is_verified

**Favourites**
- id, user_id, product_id

**Alerts**
- id, user_id, product_id, threshold_percentage, is_active

**ReporterBadges**
- id, reporter_id, badge_level (BRONZE | SILVER | GOLD | ELITE), earned_at, submission_count

### 8.3 API Structure (REST)

```
POST   /auth/register
POST   /auth/login
GET    /markets
GET    /markets/:id
GET    /products/search?q=
GET    /prices?product_id=&market_id=
POST   /prices                    (Reporter only)
PATCH  /prices/:id                (Reporter only)
POST   /prices/:id/flag           (Shopper)
GET    /vendors/:id
POST   /vendors/claim
GET    /admin/flags               (Admin only)
PATCH  /admin/flags/:id           (Admin only)
GET    /admin/analytics           (Admin only)
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| App launch time | < 2 seconds on mid-range Android |
| API response time (p95) | < 400ms for price queries |
| Availability | 99.5% uptime (excluding maintenance windows) |
| Platform support | Android 10+ and iOS 15+ |
| Language support | English and Nigerian Pidgin English |
| Offline behaviour | Graceful error states; no silent failures |
| Accessibility | WCAG 2.1 AA for contrast and touch targets (min 44×44pt) |
| Data privacy | NDPR compliant; user data not sold; location only used on-demand |
| Security | HTTPS only; JWT expiry 15 min; refresh token rotation; rate limiting on auth endpoints |
| Image uploads | Max 5MB per photo; compressed to WebP before storage |
| Minimum age | 16 years |

---

## 10. Notification Strategy

| Trigger | Recipient · Channel |
|---------|---------------------|
| Price drops by >15% on a saved item | Shopper · Push |
| New price submitted for a favourited product | Shopper (Premium) · Push |
| Weekly cheapest market summary | Shopper (Premium) · Push |
| Submission flagged by 3+ users | Admin · Push |
| Badge level-up | Reporter · In-app + Push |
| Stall claim approved or rejected | Vendor · Push |
| Subscription renewal reminder | Vendor / Shopper Premium · Push + Email |
| Account warning issued | Reporter / Vendor · In-app + Push |

---

## 11. Reporter Reputation & Badge System

Reporters earn badges based on cumulative accepted (non-flagged) submissions. Badges are visible on their public profile and next to price submissions to signal trust to shoppers.

| Badge | Requirement · Perks |
|-------|----------------------|
| 🥉 Bronze | 1–49 accepted submissions · Badge displayed on profile |
| 🥈 Silver | 50–199 accepted submissions · Priority in submission queue display |
| 🥇 Gold | 200–499 accepted submissions · Gold crown on price cards; featured on leaderboard |
| 💎 Elite | 500+ accepted submissions · Elite badge; early access to new features; co-marketing opportunities |

### 11.1 Badge Rules

- Badges are calculated on accepted submissions only (not flagged or removed ones)
- Badges cannot be downgraded once earned unless account is penalised by admin
- Reporters with 3+ removed submissions in 7 days receive a warning; 5+ triggers a review
- Weekly leaderboard resets every Monday 00:00 WAT

---

## 12. Content Moderation

### 12.1 Submission Flow

1. Reporter submits price → instantly live on the platform
2. Any user can tap "Flag this price" with a reason (Incorrect price / Outdated / Spam)
3. After 3 flags on a single submission → admin is notified via push
4. Admin reviews and takes action: Keep / Edit / Remove / Warn Reporter / Ban Reporter
5. All admin actions are logged with actor ID and timestamp

### 12.2 Automated Guardrails

- **Price outlier detection:** flag submissions that deviate >50% from the 7-day average for that product in that market
- **Duplicate detection:** block identical price submissions from the same reporter within 30 minutes
- **Photo moderation:** basic NSFW filter applied via Cloudinary on upload

---

## 13. Localisation & Accessibility

### 13.1 Language

- Default language: English
- Optional toggle: Nigerian Pidgin English (key UI strings translated)
- Product names stored with aliases to match how different users search (e.g. "tomatoe", "tomato", "igbo tomato")

### 13.2 Currency & Units

- All prices displayed in Nigerian Naira (₦)
- Units supported: per kg, per piece, per bunch, per litre, per crate, per bag
- Price display always shows unit (e.g. "₦850 / kg") — never ambiguous

### 13.3 Accessibility

- Minimum touch target size: 44 × 44 points
- Colour contrast ratio: minimum 4.5:1 for body text
- All images have descriptive alt text
- Screen reader compatible (VoiceOver / TalkBack tested)

---

## 14. Launch Plan & Milestones

| Phase | Timeline · Deliverable |
|-------|------------------------|
| Phase 0 — Foundation | Month 1 · Design system, auth, DB schema, CI/CD pipeline |
| Phase 1 — Core MVP | Months 2–3 · Shopper search & compare, Reporter submissions, Admin basic tools |
| Phase 2 — Engagement | Month 4 · Badge system, favourites, price alerts, Vendor claiming |
| Phase 3 — Monetisation | Month 5 · Paystack integration, Premium subscription, Vendor subscriptions |
| Phase 4 — Growth | Month 6 · Leaderboard, Pidgin support, App Store & Play Store launch |
| Phase 5 — Intelligence | Months 7–9 · Price trend charts, Shopping list optimiser, analytics dashboard |

---

## 15. Risks & Mitigations

| Risk | Impact · Mitigation |
|------|---------------------|
| Low Reporter supply at launch | High · Seed data manually; partner with market associations; run Reporter recruitment campaign |
| Price data goes stale quickly | High · Freshness indicator on all prices; staleness alerts; badge incentives for daily submissions |
| Vendors resist digitisation | Medium · Offer assisted onboarding via field agents; free tier to lower barrier |
| Abuse / spam submissions | Medium · Outlier detection, flag system, Reporter reputation penalties |
| Low-end device performance | Medium · Performance budgets enforced; lazy loading; image compression |
| Paystack payment failures | Low · Retry logic; fallback to bank transfer option; clear error messaging |
| NDPR non-compliance | High · Legal review before launch; privacy policy; opt-in location; data deletion endpoint |

---

## 16. Out of Scope for v1

- Offline mode (always-online is the v1 requirement)
- Non-food product categories (Electronics, Fashion, Building Materials)
- Web application version
- In-app messaging between users
- Delivery or logistics integration
- Multi-city expansion beyond Lagos
- Cash / airtime rewards for Reporters
- Machine learning price predictions (manual trend charts only in v1)

---

## 17. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| LMI | Lagos Market Intelligence — the product |
| Reporter | A user who submits and updates price data |
| Vendor | A market seller who claims a stall and publishes availability |
| Submission | A single price entry for a product at a specific market |
| Flag | A user report indicating a price submission may be incorrect |
| WAT | West Africa Time (UTC+1) — the timezone for all system timestamps |
| NDPR | Nigeria Data Protection Regulation |
| MAU | Monthly Active Users |
| EAS | Expo Application Services — used for building and submitting the app |

### B. Design Inspiration References

- **Price comparison UX:** Google Shopping, PriceCheck Nigeria
- **Crowdsourced data UX:** Waze, OpenStreetMap contributors
- **Badge/reputation system:** Stack Overflow, Duolingo
- **Market discovery:** Google Maps local business listings
- **Nigerian product UX tone:** OPay, PalmPay, Cowrywise

---

*CONFIDENTIAL — FOR INTERNAL USE ONLY*
