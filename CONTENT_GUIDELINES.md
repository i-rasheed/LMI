# Lagos Market Intelligence
## Content Guidelines

**Version 1.0 · Confidential**  
**Prepared:** July 2026  
**Companion docs:** PRD v1.0 · App Flow v1.1 · Tech Stack v2.0  
**Design direction:** Modern · Premium · Minimal

---

## Document Purpose

This document defines how LMI **looks, reads, and sounds** across every screen, notification, and touchpoint. It covers visual content standards (typography, colour, layout, cards) and written content standards (voice, tone, terminology, copy patterns).

Use this as the single reference for designers, engineers, and anyone writing in-product copy.

---

## Table of Contents

1. [Brand Foundation](#1-brand-foundation)
2. [Design Principles](#2-design-principles)
3. [Visual Content System](#3-visual-content-system)
4. [Voice & Tone](#4-voice--tone)
5. [Writing Rules](#5-writing-rules)
6. [Terminology](#6-terminology)
7. [Numbers, Currency & Units](#7-numbers-currency--units)
8. [UI Copy Patterns](#8-ui-copy-patterns)
9. [Role-Specific Guidelines](#9-role-specific-guidelines)
10. [Screen Copy Library](#10-screen-copy-library)
11. [Notifications](#11-notifications)
12. [Error, Empty & Success States](#12-error-empty--success-states)
13. [Pidgin English](#13-pidgin-english)
14. [Imagery & Icons](#14-imagery--icons)
15. [Accessibility & Inclusivity](#15-accessibility--inclusivity)
16. [Do & Don't Examples](#16-do--dont-examples)
17. [Content Governance](#17-content-governance)

---

## 1. Brand Foundation

### 1.1 Naming

| Context | Use |
|---------|-----|
| In-app UI | **LMI** |
| Onboarding, About, legal | **Lagos Market Intelligence** |
| App Store / Play Store | **LMI — Lagos Market Prices** |
| Push notifications | **LMI** prefix optional; use when space allows |
| Conversational copy | "LMI" or "the app" — never "the platform" |

### 1.2 Taglines

| Type | Copy |
|------|------|
| **Primary** | Know market prices before you go. |
| **Secondary** | Lagos markets, one tap away. |
| **Reporter** | Share prices. Build trust. |
| **Vendor** | Your stall, seen by thousands. |

### 1.3 Brand Personality

| Trait | Weight | Expression |
|-------|--------|------------|
| **Trustworthy** | Primary | Clear sourcing, timestamps, reporter badges |
| **Direct** | Primary | Short copy, no filler, Uber-style clarity |
| **Warm** | Secondary | Human, Lagos-aware, Moniepoint-style approachability |
| **Premium** | Secondary | Calm layout, refined type, no clutter |
| **Playful** | Minimal | Badge celebrations and streaks only |

### 1.4 Design References

| Reference | What we borrow |
|-----------|----------------|
| **Uber** | Direct CTAs, confident hierarchy, map-first clarity |
| **Google Maps** | Functional lists, distance/time, clean information density |
| **Moniepoint** | Premium fintech warmth, green accent, rounded cards, trust |
| **Spotify** | Large type moments, generous spacing, calm dark-on-light contrast |

### 1.5 Lagos Identity

- Copy may reference **market runs**, **area names**, and **local market names** naturally.
- Avoid stereotypes, poverty framing, or "hustle culture" jokes.
- Respect all vendors and reporters as professionals, not caricatures.
- Never mock price sensitivity — saving money is smart, not shameful.

---

## 2. Design Principles

### Content + layout principles

1. **One idea per card** — each card communicates a single price, market, or action.
2. **Lead with value** — show price or savings before metadata.
3. **Quiet chrome, loud content** — navigation and labels recede; numbers and names advance.
4. **Trust is visible** — freshness, reporter, and unit always appear together on price content.
5. **Green means go** — accent colour signals action and positive state, not decoration.
6. **Breathing room is premium** — when in doubt, add space, not elements.

---

## 3. Visual Content System

### 3.1 Colour

#### Brand palette

| Token | Hex | Usage |
|-------|-----|-------|
| `green.primary` | `#0A8F52` | Primary CTAs, active tab, links, positive badges |
| `green.dark` | `#065F36` | Pressed CTA, dark mode accent (future) |
| `green.light` | `#E8F7EF` | Card tint, selected row background, success banners |
| `neutral.900` | `#111827` | Headlines, primary text |
| `neutral.600` | `#4B5563` | Body text, secondary labels |
| `neutral.400` | `#9CA3AF` | Placeholders, metadata |
| `neutral.100` | `#F3F4F6` | Screen background |
| `neutral.0` | `#FFFFFF` | Card surface |
| `amber.warning` | `#D97706` | Stale price (24–72h) |
| `red.error` | `#DC2626` | Errors, outdated (>72h), destructive actions |

**Green usage rules:**
- Primary buttons and FAB
- Active tab icon + label
- Positive price change (drop)
- Freshness badge (<24h)
- Progress bars (badge streaks)
- **Do not** use green for body text blocks or large background fills

#### Freshness colours (price content)

| State | Colour | Label pattern |
|-------|--------|---------------|
| Fresh (<24h) | Green `#0A8F52` | Updated 3h ago |
| Aging (24–72h) | Amber `#D97706` | Updated 2d ago |
| Stale (>72h) | Red `#DC2626` | May be outdated |

### 3.2 Typography

**Typeface:** Plus Jakarta Sans (primary). System fallback: SF Pro (iOS), Roboto (Android).

| Token | Size | Weight | Line height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 32px | 700 | 40px | Welcome, paywall hero, badge unlock |
| `h1` | 28px | 700 | 36px | Screen titles |
| `h2` | 22px | 600 | 28px | Section headers, card titles |
| `h3` | 18px | 600 | 24px | List group headers |
| `body` | 16px | 400 | 24px | Default body copy |
| `body.medium` | 16px | 500 | 24px | Emphasised body |
| `caption` | 14px | 400 | 20px | Metadata, timestamps |
| `label` | 12px | 600 | 16px | Badges, chips, tab labels (uppercase optional) |
| `price` | 24px | 700 | 32px | Hero price on comparison cards |
| `price.small` | 18px | 600 | 24px | Inline list prices |

**Typography rules:**
- Sentence case for all headings and buttons — never ALL CAPS except optional `label` chips.
- Maximum two weights per screen (e.g. 400 + 600, or 400 + 700).
- Prices always use `price` or `price.small` tokens — never body weight for primary price.
- Truncate product names at 2 lines with ellipsis; never shrink price text to fit.

### 3.3 Spacing (8px grid)

| Token | Value | Usage |
|-------|-------|-------|
| `space.xs` | 4px | Icon-to-label gap |
| `space.sm` | 8px | Tight internal padding |
| `space.md` | 16px | Card padding, list item gap |
| `space.lg` | 24px | Section gap |
| `space.xl` | 32px | Screen horizontal margin |
| `space.2xl` | 48px | Hero sections, onboarding |

**Screen margins:** 20px horizontal on mobile (maps full-bleed exception).

### 3.4 Cards & surfaces

| Element | Spec |
|---------|------|
| **Large card** | White `#FFFFFF`, radius `20px`, padding `20px`, shadow below |
| **Standard card** | White, radius `16px`, padding `16px`, shadow below |
| **Compact row** | White or `neutral.100`, radius `12px`, padding `12px 16px` |
| **Chip / badge** | `green.light` or `neutral.100`, radius `999px` (pill), padding `6px 12px` |
| **Bottom sheet** | Top radius `24px`, handle bar `36×4px` `neutral.400` |

#### Shadow (soft, premium)

```
shadow.card: 0 2px 8px rgba(17, 24, 39, 0.06)
shadow.elevated: 0 4px 16px rgba(17, 24, 39, 0.08)
shadow.fab: 0 6px 20px rgba(10, 143, 82, 0.24)
```

No hard borders on cards. Use `1px solid #F3F4F6` only for dividers inside cards.

### 3.5 Buttons

| Type | Style | Copy pattern |
|------|-------|--------------|
| **Primary** | Green fill, white text, radius `14px`, height `52px` | Verb-first |
| **Secondary** | White fill, green border, green text | Alternative action |
| **Ghost** | No fill, green text | Tertiary / inline |
| **Destructive** | Red fill or red text ghost | Delete, remove, ban |

One primary button per screen. Secondary max one visible alongside primary.

### 3.6 Motion (content-aware)

| Moment | Duration | Style |
|--------|----------|-------|
| Card appear | 200ms | Fade + 8px rise |
| Sheet open | 280ms | Ease-out |
| Badge unlock | 600ms | Scale + confetti (respect reduced motion) |
| Toast | 3000ms visible | Bottom, above tab bar |

---

## 4. Voice & Tone

### 4.1 Voice attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| **Clear** | No jargon, no filler | "Updated 3h ago" not "Recently refreshed" |
| **Confident** | State facts, not guesses | "₦800 / kg" not "Around ₦800" |
| **Warm** | Human, respectful | "Thanks for reporting" not "Submission received" |
| **Honest** | Acknowledge limits | "May be outdated" not "Always accurate" |

### 4.2 Tone by context

| Context | Tone | Example |
|---------|------|---------|
| Onboarding | Welcoming, benefit-led | "Compare prices across Lagos markets in seconds." |
| Search & browse | Functional, fast | "12 markets · from ₦650" |
| Errors | Neutral, helpful | "Couldn't load prices. Try again." |
| Paywall | Value-led, not pushy | "Unlimited lists. Smarter shopping." |
| Reporter | Encouraging | "You're 8 submissions from Silver." |
| Admin | Professional, precise | "Remove price · Warn reporter" |
| Celebrations | Warm, brief | "Silver unlocked" |

### 4.3 Person & contractions

- **Second person** for user-facing copy: "Your list", "Set an alert".
- **First person** only in profile contexts: "My submissions".
- **Contractions allowed:** "We'll", "Don't", "Can't" — sounds natural on mobile.
- **Avoid:** "Please be advised", "At this time", "Kindly", "Dear user".

### 4.4 Trust language

| Use | Avoid |
|-----|-------|
| Updated, Verified reporter, Community-submitted | Guaranteed, Official, Certified, Always correct |
| May be outdated, Under review | Wrong, Fake, Lie |
| Estimated total | Exact savings (unless Premium breakdown) |

### 4.5 Humour

- **Allowed:** Badge unlocks, streak milestones (🔥 5-day streak).
- **Not allowed:** Error messages, payment failures, account warnings, moderation.

---

## 5. Writing Rules

### 5.1 Length limits

| Element | Max length |
|---------|------------|
| Button label | 28 characters |
| Tab label | 12 characters |
| Screen title | 32 characters |
| Toast | 60 characters |
| Push title | 40 characters |
| Push body | 120 characters |
| Empty state headline | 40 characters |
| Empty state body | 100 characters |
| Card metadata line | 50 characters |

### 5.2 Capitalisation

| Element | Style | Example |
|---------|-------|---------|
| Screen titles | Sentence case | Price comparison |
| Buttons | Sentence case | Find cheapest market |
| Section headers | Sentence case | Nearby markets |
| Tab labels | Sentence case | My list |
| Badges / chips | Sentence case | Updated 3h ago |
| Product names | As catalogued | Tomatoes |

### 5.3 Punctuation

- No full stop on buttons, toasts, or tab labels.
- Full stops on empty state body paragraphs and error descriptions.
- Use en dash for ranges: "7–30 days".
- Oxford comma: no (Lagos style, cleaner on mobile).

### 5.4 Numbers in copy

- Use numerals: "3 alerts", not "three alerts".
- Large numbers in marketing only: "50,000+ shoppers".
- In-product: show exact numbers where data exists.

---

## 6. Terminology

### 6.1 Approved terms

| Concept | User-facing term | Internal / admin |
|---------|------------------|------------------|
| App | LMI | LMI |
| Physical market | Market | market |
| Price contributor | Reporter | reporter |
| Stall seller | Vendor | vendor |
| Price entry | Price update | submission |
| User role (shopper) | *(hidden — no label)* | shopper |
| Paid tier | LMI Premium | premium |
| Vendor paid tier | Vendor Pro / Vendor Basic | vendor tier |
| Incorrect price report | Report price | flag |
| Shopping optimiser | Find cheapest market | optimiser |
| Saved products | Favourites | favourites |
| Price notification | Price alert | alert |

### 6.2 Never use

| Avoid | Use instead |
|-------|-------------|
| Submission (user-facing) | Price update |
| Shopper (user-facing) | — (no role label) |
| Guarantee / official price | Updated / community price |
| Cheap | Best price / Lowest price |
| User | You |
| Platform | App / LMI |
| Click here | [Descriptive action] |

### 6.3 Market & product names

- Use official catalogue spelling: **Tomatoes**, not "Tomatoe" (aliases in search only).
- Market names as locally known: **Mile 12 Market**, **Balogun Market**.
- Area names without "Lagos" suffix when unambiguous: **Surulere**, not "Surulere, Lagos".

---

## 7. Numbers, Currency & Units

### 7.1 Currency

| Rule | Example |
|------|---------|
| Always prefix with ₦ | ₦1,850 |
| Thousands separator: comma | ₦12,500 |
| No decimal places for market prices | ₦800 not ₦800.00 |
| Range | ₦650 – ₦900 |
| Approximate (optimiser only) | Est. ₦4,200 |

### 7.2 Units

| Rule | Example |
|------|---------|
| Always show unit with price | ₦800 / kg |
| Abbreviated units in lists | / kg · / piece · / bunch · / litre · / crate · / bag |
| Never price without unit | ✗ ₦800 |

### 7.3 Distance & time

| Type | Format | Example |
|------|--------|---------|
| Distance <1km | metres | 450 m |
| Distance ≥1km | 1 decimal km | 1.2 km |
| Time | minutes | 12 min |
| Combined (Premium) | both | 1.2 km · 12 min |
| Freshness | relative | Updated 3h ago · Updated 2d ago |

### 7.4 Dates

- Relative in UI: "Updated 3h ago", "This week".
- Absolute when needed: "Mon, 30 Jun".
- Timezone: WAT (UTC+1) — not shown to users unless admin.

---

## 8. UI Copy Patterns

### 8.1 Buttons — verb-first

| Context | Copy |
|---------|------|
| Primary search action | Search |
| Add to list | Add to list |
| Optimiser | Find cheapest market |
| Submit price | Submit price |
| Set alert | Set alert |
| Share | Share |
| Retry | Try again |
| Upgrade | Upgrade to Premium |
| Auth | Continue · Sign in · Create account |

### 8.2 Search placeholder

| Language | Copy |
|----------|------|
| English | Search tomatoes, rice, pepper… |
| Pidgin | Search tomatoes, rice, pepper… *(product names stay English)* |

### 8.3 Loading copy (contextual)

| Context | Copy |
|---------|------|
| Generic | Loading… |
| Prices | Loading prices… |
| Optimiser | Finding the best market for your list… |
| Search | Searching markets… |
| Upload | Uploading photo… |
| Payment | Processing payment… |

### 8.4 Toasts

| Action | Copy |
|--------|------|
| Saved favourite | Saved to favourites |
| Removed favourite | Removed from favourites |
| Alert set | Alert set |
| Price reported | Thanks — we'll review this |
| Copied | Copied |
| Network error | No connection |
| Session expired | Session expired — sign in again |

### 8.5 Confirmation dialogs

**Pattern:** Headline (question or statement) → one-line explanation → Primary CTA + Cancel

| Action | Headline | Body | Primary |
|--------|----------|------|---------|
| Logout | Sign out? | You'll need to sign in again to access your account. | Sign out |
| Delete account | Delete your account? | This permanently removes your data after 7 days. | Delete account |
| Remove list item | Remove from list? | — | Remove |
| Cancel subscription | Cancel Premium? | You'll keep access until [date]. | Cancel subscription |

---

## 9. Role-Specific Guidelines

### 9.1 Shopper (default — no role label)

- Lead with **savings and clarity**, not features.
- Home greeting: time-based, no name unless profile complete.

| Time | Greeting |
|------|----------|
| 05:00–11:59 | Good morning |
| 12:00–16:59 | Good afternoon |
| 17:00–04:59 | Good evening |

- Price cards always show: **market name → price + unit → freshness → reporter badge**.
- Freemium limits: matter-of-fact upsell, never apologetic.

| Limit hit | Copy |
|-----------|------|
| 6th list item | Your list is full on the free plan |
| Paywall CTA | Upgrade to Premium |

### 9.2 Reporter

- Encouraging, community-oriented, never gamified to the point of trivialising data quality.
- Badge names: **Bronze · Silver · Gold · Elite** (English only).
- Leaderboard: competitive but respectful — "Top reporters this week".
- Guidelines tone: coach, not police.

**Submission guidelines headline:**  
Help shoppers trust your prices

**Rules (summary):**
1. Report prices you see today.
2. Include the correct unit (per kg, per piece, etc.).
3. Add a photo when you can — it builds trust.
4. One update per product per visit.
5. Repeated false reports may lead to account review.

### 9.3 Vendor

- Simple, assisted-friendly — many vendors set up with family help.
- Short sentences. Avoid business jargon.
- Stall claim headline: **Set up your stall**
- Subscription: plain feature names, no hype.

| Tier | Display name |
|------|--------------|
| Free / pending | — |
| Basic | Vendor Basic |
| Pro | Vendor Pro |

### 9.4 Admin

- Professional, neutral, action-oriented.
- Use precise verbs: **Confirm · Edit · Remove · Warn · Suspend**.
- No emoji. No casual tone.

---

## 10. Screen Copy Library

### 10.1 Auth

| Screen | Element | Copy |
|--------|---------|------|
| Welcome | Headline | Know market prices before you go |
| Welcome | Subhead | Compare prices across Lagos markets in seconds |
| Welcome | Primary CTA | Create account |
| Welcome | Secondary CTA | Sign in |
| Register | Headline | Create your account |
| Register | Phone CTA | Continue |
| Register | Age checkbox | I am 16 or older |
| Verify OTP | Headline | Enter verification code |
| Verify OTP | Subhead | Sent to +234 XXX XXX XXXX |
| Verify OTP | Resend | Resend code in 60s |
| Login | Headline | Welcome back |
| Role select | Headline | How will you use LMI? |
| Role: Shopper | Title | Shopper |
| Role: Shopper | Desc | Find the best prices and save on your market run |
| Role: Reporter | Title | Reporter |
| Role: Reporter | Desc | Share prices and build your reputation |
| Role: Vendor | Title | Vendor |
| Role: Vendor | Desc | List your stall and reach more customers |

### 10.2 Onboarding (3 screens)

| Step | Headline | Body |
|------|----------|------|
| 1 | See prices across Lagos | Compare tomatoes, rice, and pepper from Mile 12 to Balogun — without leaving home |
| 2 | Save every week | Build a shopping list and find the one market that saves you the most |
| 3 | Prices you can trust | Every price shows who reported it and when it was last updated |
| Final CTA | Get started | — |

### 10.3 Home

| Element | Copy |
|---------|------|
| Search bar | Search products and markets |
| Section: Nearby | Nearby markets |
| Section: Trending | Trending today |
| Section: Drops | Price drops |
| Location banner | Enable location to see nearby markets |
| View map | View map |

### 10.4 Product comparison

| Element | Copy |
|---------|------|
| Title | [Product name] |
| Sort: cheapest | Cheapest |
| Sort: nearest | Nearest |
| Sort: freshest | Freshest |
| Sort: reporters | Top reporters |
| Filter | Filter |
| Empty | No prices yet for this product |
| Empty CTA (shopper) | Set alert for first price |
| Empty CTA (reporter) | Submit a price |
| Footer: save | Save |
| Footer: alert | Alert |
| Footer: share | Share |
| Premium lock | Unlock price history with Premium |

### 10.5 Shopping list

| Element | Copy |
|---------|------|
| Title | My list |
| Empty headline | Your list is empty |
| Empty body | Add items to find the cheapest market for your market run |
| Empty CTA | Add first item |
| CTA | Find cheapest market |
| Result headline | Best market for your list |
| Result subhead | Est. ₦X,XXX at [Market name] |

### 10.6 Submit price (Reporter)

| Step | Headline |
|------|----------|
| 1 | Select market |
| 2 | Select product |
| 3 | Enter price |
| 4 | Confirm & submit |
| Success | Price submitted |
| Success sub | [Badge progress line] |
| Outlier warning | This price looks unusual — double-check before submitting |
| Duplicate error | You already submitted this price recently |

### 10.7 Premium paywall

| Element | Copy |
|---------|------|
| Headline | Shop smarter with LMI Premium |
| Subhead | Unlimited lists, alerts, and price insights |
| Plan monthly | ₦1,500 / month |
| Plan annual | ₦12,000 / year · Save 33% |
| CTA | Subscribe |
| Restore | Restore purchases |
| Trust line | Secured by Paystack |

### 10.8 Settings

| Section | Items |
|---------|-------|
| Account | Edit profile · Subscription |
| Preferences | Notifications · Language · Theme |
| Privacy | Privacy policy · Terms · Export my data · Delete account |
| Support | Help centre · Contact support |
| Session | Sign out |

---

## 11. Notifications

### 11.1 Format rules

| Rule | Detail |
|------|--------|
| Prefix | LMI: optional when title has room |
| Title | Specific noun first: "Tomatoes dropped 18%" |
| Body | One fact + implicit action |
| Emoji | Not in push (in-app celebrations only) |
| Deep link | Always to relevant screen |

### 11.2 Templates

| Trigger | Title | Body |
|---------|-------|------|
| Price drop >15% | LMI: [Product] price drop | Now ₦[price] / [unit] at [Market] — down [X]% |
| New price (Premium) | LMI: New price for [Product] | ₦[price] / [unit] at [Market] |
| Weekly digest | Your weekly market summary | [Market] was cheapest for [N] of your favourites |
| Badge level-up | You earned [Badge] | [X] price updates — keep going |
| Stall approved | Your stall is live | Start adding products to reach shoppers |
| Stall rejected | Stall claim update | Tap to review and resubmit |
| Account warning | Important account notice | Tap to read |
| Subscription renewal | LMI Premium renews soon | Renews on [date] |

---

## 12. Error, Empty & Success States

### 12.1 Error tone

Neutral and actionable. Never blame the user. Never overly apologetic.

| Error | Headline | CTA |
|-------|----------|-----|
| No network | No connection | — (banner auto-dismisses) |
| API failure | Couldn't load prices | Try again |
| Timeout | Request timed out | Try again |
| Session expired | Session expired | Sign in |
| Payment failed | Payment didn't go through | Try again |
| OTP invalid | Incorrect code | — |
| Account suspended | Account suspended | Contact support |

### 12.2 Empty states

**Pattern:** Short headline → one-line body → single CTA (green primary)

| Screen | Headline | Body | CTA |
|--------|----------|------|-----|
| Favourites | No favourites yet | Save products to track prices | Search products |
| Alerts | No alerts yet | Get notified when prices drop | Search products |
| List | Your list is empty | Add items to find the best market | Add first item |
| Submissions | No price updates yet | Share your first price to start earning badges | Submit a price |
| Leaderboard | Be the first this week | Submit prices to climb the board | Submit a price |
| Search | No results for "[query]" | Try a different spelling or browse categories | Browse categories |
| Admin queue | All caught up | No flagged prices to review | — |

### 12.3 Success moments

| Moment | Copy | Visual |
|--------|------|--------|
| Price submitted | Price submitted | Green checkmark |
| Badge unlock | [Badge] unlocked | Full-screen modal, badge animation |
| Streak | 🔥 [N]-day streak | Inline on success screen |
| Stall approved | You're live | Confetti (reduced motion: static) |
| Premium activated | Welcome to Premium | Subtle green banner |

---

## 13. Pidgin English

### 13.1 Scope (v1)

Translate: navigation, CTAs, onboarding, errors, empty states.  
Do **not** translate: product names, market names, prices, badge names, legal text.

### 13.2 Tone

Clean street-natural — understandable to non-Pidgin speakers. Not exaggerated.

### 13.3 Key strings

| English | Pidgin |
|---------|--------|
| Good morning | Good morning |
| Search products and markets | Find product and market dem |
| My list | My list |
| Find cheapest market | Find cheapest market |
| Set alert | Set alert |
| Submit price | Submit price |
| No connection | Network no dey |
| Try again | Try again |
| Sign in | Sign in |
| Create account | Create account |
| No favourites yet | You never save any product |
| Loading prices… | Dey load prices… |
| Updated 3h ago | Dem update am 3h ago |
| Enable location to see nearby markets | On location make you see market wey near you |

### 13.4 Rules

- Keep strings similar length to English where possible.
- Test on device — Pidgin must not overflow buttons.
- Product names always English: **Tomatoes**, not "Tomati".

---

## 14. Imagery & Icons

### 14.1 Photography

| Type | Style |
|------|-------|
| Product catalogue | Clean, well-lit, real produce — not stock clipart |
| Market hero images | Real Lagos markets, vibrant but not chaotic |
| User uploads | Authentic price tags and stall photos — no filters required |

### 14.2 Illustrations

- Minimal line illustrations for empty states only.
- Palette: green + neutral grey — no rainbow multi-colour.
- No cartoon characters.

### 14.3 Icons

| Rule | Detail |
|------|--------|
| Style | Outlined, 1.5px stroke (Uber/Maps style) |
| Size | 24px standard, 20px inline, 28px tab bar |
| Tab bar | Icon + label always |
| Colour | `neutral.600` inactive, `green.primary` active |

### 14.4 Emoji

| Allowed | Not allowed |
|---------|-------------|
| 🔥 streaks, badge moments | Error messages, buttons, navigation |
| Share payload (WhatsApp) | Admin UI, payment screens |

### 14.5 Alt text

Descriptive for screen readers:  
"Tomatoes, from ₦650 per kg at Mile 12 Market, updated 3 hours ago."

---

## 15. Accessibility & Inclusivity

### 15.1 Reading level

- Target **CEFR A2–B1** — simple, direct sentences.
- Avoid idioms that don't translate to Pidgin.

### 15.2 Inclusive language

- Gender-neutral: "they" for reporters/vendors when gender unknown.
- No assumptions about income, education, or neighbourhood.
- "Affordable" / "best price" — not "cheap".

### 15.3 Screen readers

- Concise labels on buttons: "Set price alert for tomatoes" not "Alert".
- Announce price changes and freshness.
- Minimum touch target 44×44pt with readable label.

### 15.4 Contrast

- Body text `neutral.600` on white: minimum 4.5:1.
- Green button white text: verified against `#0A8F52`.
- Never convey state by colour alone — always pair with text label.

---

## 16. Do & Don't Examples

### Voice

| Don't | Do |
|-------|-----|
| Kindly submit your price update | Submit price |
| Guaranteed lowest price in Lagos | Lowest price from 12 markets |
| Oops! Something went wrong 😅 | Couldn't load prices. Try again. |
| Cheap tomatoes near you!!! | Tomatoes from ₦650 / kg nearby |
| Your submission has been received | Price submitted |

### Visual

| Don't | Do |
|-------|-----|
| 5 buttons on one card | 1 primary action per card |
| 8px padding in large cards | 20px padding, 20px radius |
| Green body text paragraphs | Green for CTAs and accents only |
| ALL CAPS BUTTONS | Sentence case buttons |
| Price without unit | ₦800 / kg |
| Dense 4-line card headers | Name + price + one metadata line |

### Trust

| Don't | Do |
|-------|-----|
| Official Mile 12 price | ₦800 / kg · Updated 3h ago |
| Always accurate | May be outdated (when >72h) |
| Fake price! | Report price |

---

## 17. Content Governance

### 17.1 Approval

| Content type | Owner |
|--------------|-------|
| UI microcopy (new screens) | Product + this doc |
| Legal (Terms, Privacy) | Legal review before launch |
| Push notifications (broadcast) | Admin + Product |
| Pidgin strings | Product review with native speaker |
| App Store listing | Marketing + Product |

### 17.2 Adding new copy

1. Check terminology (Section 6).
2. Match voice attributes (Section 4).
3. Apply length limits (Section 5.1).
4. Add to copy library if reusable.
5. Provide Pidgin equivalent if in scope.

### 17.3 WhatsApp share format

```
🍅 Tomatoes across Lagos markets
Lowest: ₦800/kg at Mile 12 Market
Compare prices: https://lmi.ng/p/[id]
— LMI
```

Casual, factual, one emoji max in share payload.

### 17.4 App Store tone

Slightly more marketing than in-app, but same voice:

**Subtitle:** Compare Lagos market prices  
**Description lead:** Stop guessing. LMI shows you real grocery prices across Lagos markets — updated daily by people who shop there.

---

## Appendix A: Design Token Quick Reference

```
Colours:    #0A8F52  #111827  #4B5563  #9CA3AF  #F3F4F6  #FFFFFF
Radius:     12px compact · 16px card · 20px large · 24px sheet · 14px button
Spacing:    4 · 8 · 16 · 24 · 32 · 48 (px)
Type:       Plus Jakarta Sans — 32/28/22/18/16/14/12
Shadow:     0 2px 8px rgba(17,24,39,0.06)
```

## Appendix B: Tab Labels

| Tab | English | Pidgin |
|-----|---------|--------|
| Home | Home | Home |
| Search | Search | Search |
| My List | My list | My list |
| Alerts | Alerts | Alerts |
| Profile | Profile | Profile |
| Vendor Dashboard | Dashboard | Dashboard |
| Admin | Admin | Admin |

---

*CONFIDENTIAL — FOR INTERNAL USE ONLY*  
*Lagos Market Intelligence · Content Guidelines v1.0*
