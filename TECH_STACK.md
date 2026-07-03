# Lagos Market Intelligence — Technical Stack

**Version 2.0 · Locked Dependencies**  
**Prepared:** July 2026  
**Status:** Authoritative — all versions pinned exactly  
**Companion docs:** PRD v1.0 · App Flow v1.1

---

## 1. Version Policy

| Rule | Application |
|------|-------------|
| **Exact pins** | Every dependency uses `X.Y.Z` — no `^` or `~` in production manifests |
| **Age ceiling** | No package first published after **July 2024**, unless it is the **dominant** library in its category |
| **Maturity** | Only packages with widespread production use; no alpha/beta in production paths |
| **Expo alignment** | All `expo-*` packages locked to **SDK 55** patch versions verified against `expo@55.0.27` |
| **Native alignment** | `react-native` and navigation packages taken from Expo `bundledNativeModules.json` |

### Dominant-library exceptions (post–July 2024)

| Package | Reason |
|---------|--------|
| `expo@55.x` | Required target SDK; dominant RN toolchain |
| `react-native@0.83.x` | Pinned by Expo SDK 55 |
| `react@19.2.x` | Pinned by Expo SDK 55 |
| `@tanstack/react-query@5.x` | Dominant server-state library (replaces React Query) |
| `zustand@5.x` | Dominant lightweight client-state library |
| `react-native-reanimated@4.x` | Required by Expo SDK 55 New Architecture |

### Important correction

Earlier drafts referenced **React Native 0.82**. **Expo SDK 55 requires React Native 0.83.6** and **React 19.2.0**. This document locks the official Expo pairing.

---

## 2. Runtime & Toolchain

| Tool | Exact version | Notes |
|------|---------------|-------|
| **Node.js** | `20.19.4` | Expo SDK 55 minimum LTS; use on Render and locally |
| **pnpm** | `10.12.1` | Package manager (monorepo workspaces) |
| **Turbo** | `2.5.4` | Monorepo task orchestration |
| **TypeScript** | `5.8.3` | Strict mode across all packages |
| **EAS CLI** | `16.13.0` | Build and submit (pin globally or in CI) |
| **Xcode** | `26.2` | Minimum for iOS builds (SDK 55) |
| **Android compileSdk** | `36` | SDK 55 default |
| **Maestro CLI** | `1.41.0` | E2E tests (installed separately, not an npm dep) |

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  apps/mobile — Expo SDK 55 · React Native 0.83.6 · TypeScript    │
│  Expo Router · TanStack Query · Zustand · RHF · Zod                │
│  Supabase Auth + Storage (client) · NestJS REST (business logic)   │
└────────────┬───────────────────────────────┬─────────────────────┘
             │                               │
             ▼                               ▼
┌────────────────────────┐     ┌─────────────────────────────────────┐
│  Supabase Cloud        │     │  apps/api — NestJS 11 on Render     │
│  · PostgreSQL + RLS    │◄───►│  · Service-role Supabase client     │
│  · Auth (OTP/OAuth)    │     │  · Paystack webhooks                │
│  · Storage (images)    │     │  · Expo Push dispatch               │
│  · Migrations (CLI)    │     │  · Gemini API proxy                 │
└────────────────────────┘     └─────────────────────────────────────┘
             │                               │
             ▼                               ▼
   Google Maps (Android)              Paystack · Gemini · Expo Push
   Apple Maps (iOS)
```

### Data access pattern

| Layer | Access |
|-------|--------|
| **Auth** | `@supabase/supabase-js` directly from mobile |
| **Image upload** | `expo-image-picker` → `expo-image-manipulator` → Supabase Storage |
| **All business data** | NestJS REST (`/api/v1/*`) via TanStack Query |
| **Admin writes** | NestJS with Supabase service-role key only |

---

## 4. Monorepo Layout

```
lmi/
├── package.json                 # workspace root
├── pnpm-workspace.yaml
├── turbo.json
├── .nvmrc                       # 20.19.4
├── apps/
│   ├── mobile/                  # Expo app
│   └── api/                     # NestJS API
├── packages/
│   └── shared/                  # Zod schemas, types, constants
└── supabase/
    ├── config.toml
    └── migrations/
```

---

## 5. Root `package.json`

```json
{
  "name": "lmi",
  "private": true,
  "packageManager": "pnpm@10.12.1",
  "engines": {
    "node": "20.19.4",
    "pnpm": "10.12.1"
  },
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "2.5.4",
    "typescript": "5.8.3",
    "prettier": "3.5.3",
    "eslint": "9.28.0"
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `.nvmrc`

```
20.19.4
```

---

## 6. Mobile App — `apps/mobile/package.json`

### 6.1 Core framework

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | `55.0.27` | SDK root |
| `react` | `19.2.0` | UI runtime |
| `react-native` | `0.83.6` | Native runtime (Expo-pinned) |
| `expo-router` | `55.0.16` | File-based navigation |
| `typescript` | `5.8.3` | Type safety |

### 6.2 Expo SDK modules

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-asset` | `55.0.17` | Static assets |
| `expo-auth-session` | `55.0.17` | Google OAuth |
| `expo-build-properties` | `55.0.15` | Native build config |
| `expo-constants` | `55.0.16` | App constants |
| `expo-crypto` | `55.0.16` | Cryptographic helpers |
| `expo-dev-client` | `55.0.36` | Development builds |
| `expo-device` | `55.0.18` | Device info |
| `expo-file-system` | `55.0.23` | Local file access |
| `expo-font` | `55.0.8` | Custom fonts |
| `expo-haptics` | `55.0.15` | Haptic feedback |
| `expo-image` | `55.0.11` | Optimised image component |
| `expo-image-manipulator` | `55.0.18` | Compress before upload |
| `expo-image-picker` | `55.0.21` | Camera / gallery |
| `expo-linking` | `55.0.16` | Deep links |
| `expo-localization` | `55.0.16` | Locale detection |
| `expo-location` | `55.1.11` | GPS / nearby markets |
| `expo-notifications` | `55.0.24` | Push registration |
| `expo-secure-store` | `55.0.15` | Supabase session storage |
| `expo-splash-screen` | `55.0.22` | Launch splash |
| `expo-status-bar` | `55.0.6` | Status bar |
| `expo-updates` | `55.0.25` | OTA updates (EAS Update) |
| `expo-web-browser` | `55.0.17` | Paystack checkout |
| `@expo/vector-icons` | `15.0.2` | Tab / UI icons |

### 6.3 Navigation & UI primitives

| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-screens` | `4.23.0` | Native screen containers |
| `react-native-safe-area-context` | `5.6.2` | Safe area insets |
| `react-native-gesture-handler` | `2.30.0` | Touch gestures |
| `react-native-reanimated` | `4.2.1` | Animations (required by Expo 55) |
| `react-native-worklets` | `0.7.4` | Reanimated peer |
| `react-native-svg` | `15.15.3` | SVG (charts, icons) |
| `@gorhom/bottom-sheet` | `5.2.14` | Flag / alert / filter sheets |
| `@shopify/flash-list` | `2.0.2` | High-performance lists |
| `react-native-keyboard-controller` | `1.20.7` | Keyboard-aware forms |

### 6.4 State, forms & validation

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | `5.80.7` | Server state / caching |
| `zustand` | `5.0.5` | Client state (auth, prefs) |
| `react-hook-form` | `7.57.0` | Form state |
| `@hookform/resolvers` | `5.1.1` | Zod resolver for RHF |
| `zod` | `3.25.67` | Runtime validation (shared schemas) |

### 6.5 Supabase & networking

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | `2.49.8` | Auth + Storage client |
| `react-native-url-polyfill` | `2.0.0` | Required Supabase RN polyfill |
| `@react-native-async-storage/async-storage` | `2.2.0` | Non-sensitive cache |
| `@react-native-community/netinfo` | `11.5.2` | Offline banner detection |
| `react-native-webview` | `13.16.0` | Paystack fallback WebView |

### 6.6 Maps, charts & media

| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-maps` | `1.27.2` | Google Maps (Android) / Apple Maps (iOS) |
| `react-native-gifted-charts` | `1.4.61` | Price history & analytics charts |

> **Not used:** `expo-maps` — alpha status; breaks Expo Go. `react-native-maps` is mature and Expo-bundled.

### 6.7 Localisation

| Package | Version | Purpose |
|---------|---------|---------|
| `i18next` | `23.16.8` | Translation engine |
| `react-i18next` | `15.5.2` | React bindings (Pidgin support) |

### 6.8 Observability

| Package | Version | Purpose |
|---------|---------|---------|
| `@sentry/react-native` | `7.11.0` | Crash & error reporting (Expo-bundled line) |
| `sentry-expo` | `7.0.0` | Expo Sentry integration |
| `posthog-react-native` | `3.16.1` | Product analytics |

### 6.9 Shared workspace package

| Package | Version | Purpose |
|---------|---------|---------|
| `@lmi/shared` | `workspace:*` | Zod schemas, types, constants |

### 6.10 Complete `apps/mobile/package.json`

```json
{
  "name": "@lmi/mobile",
  "version": "1.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start --dev-client",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "@expo/vector-icons": "15.0.2",
    "@gorhom/bottom-sheet": "5.2.14",
    "@hookform/resolvers": "5.1.1",
    "@lmi/shared": "workspace:*",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-native-community/netinfo": "11.5.2",
    "@sentry/react-native": "7.11.0",
    "@shopify/flash-list": "2.0.2",
    "@supabase/supabase-js": "2.49.8",
    "@tanstack/react-query": "5.80.7",
    "expo": "55.0.27",
    "expo-asset": "55.0.17",
    "expo-auth-session": "55.0.17",
    "expo-build-properties": "55.0.15",
    "expo-constants": "55.0.16",
    "expo-crypto": "55.0.16",
    "expo-dev-client": "55.0.36",
    "expo-device": "55.0.18",
    "expo-file-system": "55.0.23",
    "expo-font": "55.0.8",
    "expo-haptics": "55.0.15",
    "expo-image": "55.0.11",
    "expo-image-manipulator": "55.0.18",
    "expo-image-picker": "55.0.21",
    "expo-linking": "55.0.16",
    "expo-localization": "55.0.16",
    "expo-location": "55.1.11",
    "expo-notifications": "55.0.24",
    "expo-router": "55.0.16",
    "expo-secure-store": "55.0.15",
    "expo-splash-screen": "55.0.22",
    "expo-status-bar": "55.0.6",
    "expo-updates": "55.0.25",
    "expo-web-browser": "55.0.17",
    "i18next": "23.16.8",
    "posthog-react-native": "3.16.1",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-hook-form": "7.57.0",
    "react-i18next": "15.5.2",
    "react-native": "0.83.6",
    "react-native-gesture-handler": "2.30.0",
    "react-native-gifted-charts": "1.4.61",
    "react-native-keyboard-controller": "1.20.7",
    "react-native-maps": "1.27.2",
    "react-native-reanimated": "4.2.1",
    "react-native-safe-area-context": "5.6.2",
    "react-native-screens": "4.23.0",
    "react-native-svg": "15.15.3",
    "react-native-url-polyfill": "2.0.0",
    "react-native-webview": "13.16.0",
    "react-native-worklets": "0.7.4",
    "sentry-expo": "7.0.0",
    "zod": "3.25.67",
    "zustand": "5.0.5"
  },
  "devDependencies": {
    "@babel/core": "7.27.4",
    "@testing-library/react-native": "13.2.0",
    "@types/react": "19.1.6",
    "babel-preset-expo": "55.0.23",
    "eslint": "9.28.0",
    "eslint-config-prettier": "10.1.5",
    "eslint-plugin-react": "7.37.5",
    "eslint-plugin-react-hooks": "5.2.0",
    "eslint-plugin-react-native": "5.0.0",
    "jest": "29.7.0",
    "jest-expo": "55.0.19",
    "prettier": "3.5.3",
    "typescript": "5.8.3"
  }
}
```

### 6.11 Styling decision

**Custom `StyleSheet` + design tokens** — no UI component library.

| Rejected | Reason |
|----------|--------|
| NativeWind v4 | Adds Tailwind build chain; v4 still stabilising |
| Tamagui | Large dependency surface |
| React Native Paper | Material Design mismatches OPay-style UX target |
| `expo-maps` | Alpha; not production-ready |

Design tokens live in `apps/mobile/src/theme/`.

---

## 7. API — `apps/api/package.json`

### 7.1 NestJS core

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/common` | `11.1.27` | Framework core |
| `@nestjs/core` | `11.1.27` | DI container |
| `@nestjs/platform-express` | `11.1.27` | HTTP adapter |
| `@nestjs/config` | `4.0.2` | Environment config |
| `@nestjs/throttler` | `6.4.0` | Rate limiting |
| `@nestjs/swagger` | `11.2.0` | OpenAPI docs |
| `@nestjs/schedule` | `6.0.0` | Cron (alerts, digests) |
| `reflect-metadata` | `0.2.2` | Decorator metadata |
| `rxjs` | `7.8.2` | Reactive streams |

### 7.2 Data & auth

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | `2.49.8` | Service-role DB + Storage |
| `jose` | `5.9.6` | Supabase JWT verification (JWKS) |
| `nestjs-zod` | `4.3.1` | Zod validation pipes (Zod 3 compatible) |
| `zod` | `3.25.67` | DTO schemas (shared with mobile) |
| `class-validator` | `0.14.2` | Supplementary NestJS validation |
| `class-transformer` | `0.5.1` | DTO transformation |

### 7.3 Integrations

| Package | Version | Purpose |
|---------|---------|---------|
| `@google/generative-ai` | `0.24.1` | Gemini API (search, moderation, digests) |
| `expo-server-sdk` | `3.15.0` | Expo Push Notifications |
| `axios` | `1.7.9` | Paystack REST API calls |
| `sharp` | `0.33.5` | Server-side image processing |
| `date-fns` | `3.6.0` | Date formatting / cron logic |
| `uuid` | `10.0.0` | ID generation |

> **Not used:** `paystack-api` npm package — unmaintained wrapper. Direct Paystack REST via `axios`.

### 7.4 Security & middleware

| Package | Version | Purpose |
|---------|---------|---------|
| `helmet` | `8.1.0` | HTTP security headers |
| `compression` | `1.8.0` | Response compression |

### 7.5 Complete `apps/api/package.json`

```json
{
  "name": "@lmi/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@google/generative-ai": "0.24.1",
    "@lmi/shared": "workspace:*",
    "@nestjs/common": "11.1.27",
    "@nestjs/config": "4.0.2",
    "@nestjs/core": "11.1.27",
    "@nestjs/platform-express": "11.1.27",
    "@nestjs/schedule": "6.0.0",
    "@nestjs/swagger": "11.2.0",
    "@nestjs/throttler": "6.4.0",
    "@supabase/supabase-js": "2.49.8",
    "axios": "1.7.9",
    "class-transformer": "0.5.1",
    "class-validator": "0.14.2",
    "compression": "1.8.0",
    "date-fns": "3.6.0",
    "expo-server-sdk": "3.15.0",
    "helmet": "8.1.0",
    "jose": "5.9.6",
    "nestjs-zod": "4.3.1",
    "reflect-metadata": "0.2.2",
    "rxjs": "7.8.2",
    "sharp": "0.33.5",
    "uuid": "10.0.0",
    "zod": "3.25.67"
  },
  "devDependencies": {
    "@nestjs/cli": "11.0.7",
    "@nestjs/schematics": "11.0.5",
    "@nestjs/testing": "11.1.27",
    "@types/compression": "1.7.5",
    "@types/express": "5.0.2",
    "@types/jest": "29.5.14",
    "@types/node": "22.15.30",
    "@types/supertest": "6.0.3",
    "@types/uuid": "10.0.0",
    "@typescript-eslint/eslint-plugin": "8.33.1",
    "@typescript-eslint/parser": "8.33.1",
    "eslint": "9.28.0",
    "eslint-config-prettier": "10.1.5",
    "jest": "29.7.0",
    "prettier": "3.5.3",
    "supertest": "7.1.1",
    "ts-jest": "29.3.4",
    "ts-node": "10.9.2",
    "typescript": "5.8.3"
  }
}
```

---

## 8. Shared Package — `packages/shared/package.json`

```json
{
  "name": "@lmi/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "3.25.67"
  },
  "devDependencies": {
    "typescript": "5.8.3"
  }
}
```

### Exported Zod schemas

| Schema | Consumers |
|--------|-----------|
| `registerSchema` | mobile Register, api auth |
| `loginSchema` | mobile Login |
| `submitPriceSchema` | mobile Submit, api prices |
| `stallClaimSchema` | mobile Vendor claim, api vendors |
| `vendorProductSchema` | mobile Vendor products, api vendors |
| `alertSchema` | mobile Alerts sheet, api alerts |
| `flagPriceSchema` | mobile Flag sheet, api prices |
| `profileSchema` | mobile Edit profile, api users |

---

## 9. Infrastructure & External Services

### 9.1 Supabase Cloud

| Component | Version / tier | Purpose |
|-----------|----------------|---------|
| **PostgreSQL** | Supabase-managed (v15+) | Primary database |
| **Supabase Auth** | Platform | Phone OTP, email/password, Google OAuth |
| **Supabase Storage** | Platform | Image buckets |
| **Supabase CLI** | `2.30.4` | Local dev + migrations |
| **Row Level Security** | Enabled on all public tables | Client-side access control |

#### Storage buckets

| Bucket | Max size | MIME types |
|--------|----------|------------|
| `submissions` | 5 MB | `image/jpeg`, `image/webp` |
| `stalls` | 5 MB | `image/jpeg`, `image/webp` |
| `products` | 5 MB | `image/jpeg`, `image/webp` |
| `avatars` | 2 MB | `image/jpeg`, `image/webp` |

### 9.2 Render

| Service | Runtime | Purpose |
|---------|---------|---------|
| **Web Service** | Node `20.19.4` | NestJS API (`@lmi/api`) |
| **Cron Job** | Node `20.19.4` | Alert evaluation, weekly digest, leaderboard reset |

Build command: `pnpm install --frozen-lockfile && pnpm --filter @lmi/api build`  
Start command: `node apps/api/dist/main.js`

### 9.3 EAS Build

| Setting | Value |
|---------|-------|
| EAS CLI | `16.13.0` |
| Build profile `development` | Dev client, internal distribution |
| Build profile `preview` | Internal QA |
| Build profile `production` | App Store + Play Store |
| Update channel | `production` via `expo-updates@55.0.25` |

### 9.4 External APIs (no npm package — REST only)

| Service | SDK / client | Version |
|---------|--------------|---------|
| **Paystack** | `axios` direct REST | API v2 |
| **Google Maps** | `react-native-maps@1.27.2` | Maps SDK Android / MapKit iOS |
| **Google Gemini** | `@google/generative-ai@0.24.1` | `gemini-2.0-flash` model |
| **Expo Push** | `expo-server-sdk@3.15.0` | Push API v2 |

---

## 10. Testing

| Layer | Tool | Version | Scope |
|-------|------|---------|-------|
| Mobile unit | `jest` | `29.7.0` | Utils, hooks, schemas |
| Mobile unit | `jest-expo` | `55.0.19` | Expo preset |
| Mobile unit | `@testing-library/react-native` | `13.2.0` | Component tests |
| API unit | `jest` | `29.7.0` | Services, guards |
| API unit | `ts-jest` | `29.3.4` | TypeScript transform |
| API e2e | `supertest` | `7.1.1` | HTTP endpoint tests |
| E2E mobile | **Maestro CLI** | `1.41.0` | Auth, search, submit flows |

> **Not used:** Detox — heavier setup; Maestro is dominant for Expo RN E2E in 2025–2026.

---

## 11. Linting & Git Hooks

| Tool | Version | Scope |
|------|---------|-------|
| `eslint` | `9.28.0` | All packages |
| `@typescript-eslint/eslint-plugin` | `8.33.1` | TypeScript rules |
| `@typescript-eslint/parser` | `8.33.1` | TS parser |
| `eslint-config-prettier` | `10.1.5` | Disable conflicting rules |
| `eslint-plugin-react` | `7.37.5` | Mobile |
| `eslint-plugin-react-hooks` | `5.2.0` | Mobile |
| `eslint-plugin-react-native` | `5.0.0` | Mobile |
| `prettier` | `3.5.3` | Formatting |
| `husky` | `9.1.7` | Git hooks |
| `lint-staged` | `16.1.0` | Pre-commit |
| `@commitlint/cli` | `19.8.1` | Commit messages |
| `@commitlint/config-conventional` | `19.8.1` | Conventional commits |

---

## 12. Environment Variables

### Mobile (`apps/mobile/.env`)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_API_URL=https://api.lmi.ng/api/v1
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
EXPO_PUBLIC_SENTRY_DSN=https://...
EXPO_PUBLIC_POSTHOG_KEY=phc_...
```

### API (`apps/api/.env` — Render dashboard)

```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://postgres:...@db.xxxx.supabase.co:5432/postgres
PAYSTACK_SECRET_KEY=sk_live_...
EXPO_ACCESS_TOKEN=ExpoToken_...
GOOGLE_GEMINI_API_KEY=AIza...
GOOGLE_MAPS_API_KEY=AIza...
SENTRY_DSN=https://...
CORS_ORIGIN=*
API_MIN_VERSION=1.0.0
```

---

## 13. CI/CD — GitHub Actions (pinned action versions)

| Action | Version | Purpose |
|--------|---------|---------|
| `actions/checkout` | `v4.2.2` | Clone repo |
| `pnpm/action-setup` | `v4.1.0` | Install pnpm `10.12.1` |
| `actions/setup-node` | `v4.4.0` | Node `20.19.4` |
| `expo/expo-github-action` | `v8.0.0` | EAS Build |

---

## 14. Gemini API Usage

All calls via NestJS `AiModule` — **never expose API key to mobile**.

| Endpoint | Model | Feature |
|----------|-------|---------|
| `POST /api/v1/ai/search` | `gemini-2.0-flash` | Fuzzy product search, alias expansion |
| `POST /api/v1/ai/moderate` | `gemini-2.0-flash` | Admin flag review summary |
| `POST /api/v1/ai/digest` | `gemini-2.0-flash` | Premium weekly shopping narrative |
| `POST /api/v1/ai/explain-outlier` | `gemini-2.0-flash` | Reporter outlier warning copy |

**Fallback:** PostgreSQL full-text search + static templates if Gemini unavailable.

---

## 15. Security Summary

| Concern | Implementation |
|---------|----------------|
| Transport | HTTPS only (Render + Supabase) |
| Auth tokens | Supabase session JWT; stored in `expo-secure-store` |
| API auth | `jose@5.9.6` JWKS verification in NestJS guard |
| Rate limiting | `@nestjs/throttler@6.4.0` — 10 req/min on auth, 30 req/min on submit |
| Secrets | Render env vars; only Supabase anon key in mobile |
| RLS | All public tables; service-role bypass server-side only |
| Image safety | Gemini safety settings + manual admin review |
| NDPR | Account export/delete via NestJS endpoints |

---

## 16. Deferred / Out of Scope v1

| Item | Reason |
|------|--------|
| Redis | TanStack Query client cache sufficient for v1 |
| Prisma / TypeORM | Supabase JS client covers data access |
| `expo-maps` | Alpha status |
| NativeWind / Tamagui | Custom StyleSheet preferred |
| Dark mode | Light + system deferred |
| Biometric auth | Post-v1 |
| FCM direct | Expo Push sufficient |
| Zod 4 | Zod 3.25.67 stable; shared with `nestjs-zod@4.3.1` |
| Jest 30 | Jest 29 dominant and stable |

---

## 17. Upgrade Policy

1. **Expo SDK** — upgrade one major at a time; run `npx expo install --fix` within new SDK only
2. **Patch updates** — allowed after CI passes; update this document
3. **NestJS** — keep all `@nestjs/*` packages on same minor line
4. **Supabase JS** — upgrade mobile and API together
5. **Never** auto-upgrade production deps without lockfile review

### Verify command

```bash
# After any version change, regenerate lockfile and verify
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
npx expo-doctor
```

---

## 18. PRD → Stack Mapping

| PRD specification | Locked implementation |
|-------------------|----------------------|
| React Native (Expo) | `expo@55.0.27` + `react-native@0.83.6` |
| Expo Router | `expo-router@55.0.16` |
| TanStack Query | `@tanstack/react-query@5.80.7` |
| Zustand | `zustand@5.0.5` |
| Node.js backend | `NestJS@11.1.27` on Render |
| PostgreSQL | Supabase Cloud |
| Redis | Deferred |
| Cloudinary | `Supabase Storage` |
| JWT + Termii/Twilio | `Supabase Auth` |
| Expo Push + FCM | `expo-notifications@55.0.24` + `expo-server-sdk@3.15.0` |
| Paystack | `axios@1.7.9` → Paystack REST |
| Google Maps | `react-native-maps@1.27.2` |
| Gifted Charts | `react-native-gifted-charts@1.4.61` |
| Gemini AI | `@google/generative-ai@0.24.1` |

---

## 19. Dependency Count Summary

| Package group | Count |
|---------------|-------|
| Mobile production deps | 54 |
| Mobile dev deps | 14 |
| API production deps | 22 |
| API dev deps | 18 |
| Shared deps | 1 |
| Root dev deps | 4 |
| **Total pinned packages** | **~113** |

---

*CONFIDENTIAL — FOR INTERNAL USE ONLY*  
*Lagos Market Intelligence · Technical Stack v2.0 · All versions locked*
