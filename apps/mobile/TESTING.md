# Mobile manual test checklist (M05 — Auth & onboarding)

Run the app with a configured Supabase/API this device can reach:

```bash
pnpm --filter @lmi/mobile dev
```

Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` (e.g. your machine LAN IP, not `localhost`, when testing on a physical device).

## Prerequisites

- Remote Supabase project linked; `role_selected_at` migration applied (`npx supabase db push`).
- `apps/api` running with valid Supabase service role + JWT settings.
- Email auth enabled in Supabase (confirm email off for faster dev testing, optional).

---

## 1. Welcome (unauthenticated)

| Step | Action | Expected |
|------|--------|----------|
| 1.1 | Fresh install / signed out | Lands on Welcome |
| 1.2 | Read copy | Headline: “Know market prices before you go”; subhead matches guidelines |
| 1.3 | Tap **Create account** | Opens Register |
| 1.4 | Back → Tap **Sign in** | Opens Login |

## 2. Register (email + password)

| Step | Action | Expected |
|------|--------|----------|
| 2.1 | Submit empty form | Validation errors on email/password/age |
| 2.2 | Enter invalid email | “Enter a valid email address” |
| 2.3 | Password &lt; 8 chars or no number | Password validation message |
| 2.4 | Valid email/password, age unchecked | “You must be 16 or older to use LMI” |
| 2.5 | Valid form, **Continue** | Supabase sign-up succeeds; navigates to Role select (or blocked if suspended) |
| 2.6 | Tap **Sign in** link | Opens Login |

## 3. Login

| Step | Action | Expected |
|------|--------|----------|
| 3.1 | Wrong password | Supabase error shown inline |
| 3.2 | Valid credentials, onboarding incomplete | Role select or onboarding step 1 |
| 3.3 | Valid credentials, onboarding complete | Home tab (or Vendor tab for vendor role) |
| 3.4 | Tap **Forgot password?** | Opens Forgot password |
| 3.5 | Tap **Create account** | Opens Register |

## 4. Forgot password

| Step | Action | Expected |
|------|--------|----------|
| 4.1 | Submit valid email | Success screen: “Check your email” |
| 4.2 | Tap **Back to sign in** | Returns to Login |

## 5. Role select

| Step | Action | Expected |
|------|--------|----------|
| 5.1 | Continue without selection | “Select how you will use LMI” |
| 5.2 | Select Shopper → **Continue as Shopper** | `POST /users/me/role`; onboarding step 1 |
| 5.3 | *(New user)* Select Reporter / Vendor | Same flow; step 2 copy differs by role |
| 5.4 | Verify Supabase `profiles` | `role` and `role_selected_at` set |

## 6. Onboarding (3 steps)

| Step | Action | Expected |
|------|--------|----------|
| 6.1 | Step 1 copy | “See prices across Lagos” + body from guidelines |
| 6.2 | **Continue** → Step 2 | Role-specific headline (Shopper / Reporter / Vendor) |
| 6.3 | **Skip** on any step | Advances or completes (step 3 skip = finish) |
| 6.4 | Step 3 **Get started** | `POST /users/me/onboarding`; lands on Home (or Vendor tab) |
| 6.5 | Verify Supabase `profiles` | `onboarding_completed_at` set |
| 6.6 | Kill app, reopen | Skips onboarding; goes straight to tabs |

## 7. Blocked account

| Step | Action | Expected |
|------|--------|----------|
| 7.1 | In Supabase Studio, set `account_status` to `suspended` or `banned` | — |
| 7.2 | Open app (signed in) | Redirects to `/blocked` |
| 7.3 | Copy | “Account suspended” + support contact |
| 7.4 | **Sign out** | Returns to Welcome |

## 8. Sign out

| Step | Action | Expected |
|------|--------|----------|
| 8.1 | Sign out from Profile/settings (when wired) | Session cleared; Welcome screen |

---

## API smoke (optional)

```bash
pnpm --filter @lmi/api test:e2e
```

Confirms `/users/me` rejects missing/invalid tokens.

## Notes

- Maestro flows can be added later under `apps/mobile/.maestro/`; this checklist covers M05 without Detox/Maestro setup.
- Phone OTP auth is out of scope for M05 (email only).
