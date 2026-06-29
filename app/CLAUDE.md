# Gym — Student App (Expo / React Native, White-Label)

The student-facing mobile app, built with **Expo + React Native** so we
ship one codebase to iOS, Android, and (when needed) the web. Each academy
gets a fully white-labeled experience: their logo, their colors, their
subdomain — themed at runtime from the academy branding payload returned
by the GraphQL API.

> **Why Expo (not Next.js)?** The app is the daily-use surface for actual
> gym members — install on a phone, push notifications, biometric login,
> camera (progress photos), Apple/Google Pay receipts. Expo gives us all
> of that with one TypeScript codebase, OTA updates via EAS, and a build
> pipeline we don't have to babysit. The **website** (marketing + admin)
> stays on Next.js — see [`website/CLAUDE.md`](../website/CLAUDE.md).

## Stack

- **Expo SDK 54** (React Native 0.81)
- **TypeScript** (strict)
- **expo-router 6** (file-system routing — same mental model as Next.js)
- **Apollo Client 4** + `graphql` — every data call goes through GraphQL
- **Plain `StyleSheet`** with a shared token module at `lib/theme.ts`
  (no NativeWind — see [design-decisions §4.10](../docs/design-decisions.md))
- **lucide-react-native** + `react-native-svg` for icons
- **react-native-safe-area-context** for notch-aware layouts
- **expo-secure-store** for the JWT (NOT AsyncStorage — secrets belong in the keychain)
- **expo-clipboard** (PIX copia-e-cola / boleto), **expo-image-picker** (profile photo, Fase 5)
- **@graphql-codegen/cli** (client preset) for type-safe queries

Planned on-demand:
- `expo-notifications` for class reminders + payment alerts
- `expo-image` for fast image rendering
- `react-hook-form` + `zod` for forms
- `date-fns` with the `pt-BR` locale

## Setup (for a fresh clone)

```bash
cd app
npm install
cp .env.example .env          # override EXPO_PUBLIC_GRAPHQL_ENDPOINT if needed
npm run codegen               # generates gql/
npm run start                 # starts the Metro bundler
```

The initial scaffold used `create-expo-app@latest` with the
`blank-typescript` template. Since then we've added `@apollo/client@4`,
`graphql`, `expo-secure-store`, `@graphql-codegen/cli` +
`@graphql-codegen/client-preset`, `expo-router` (+ `expo-linking`,
`expo-constants`, `react-native-safe-area-context`,
`react-native-screens`) and `lucide-react-native` +
`react-native-svg`.

`app.json` already sets:
- `expo.scheme = "gymapp"` (deep links)
- `expo.plugins` includes `expo-router` and `expo-secure-store`

Still to add when we need them:
- `expo.notification` icon + color (per default branding)
- `expo.ios.bundleIdentifier = "app.gym.student"`
- `expo.android.package = "app.gym.student"`

## Structure

```
app/
├── app/                          # expo-router (file-based)
│   ├── _layout.tsx               # Root: Apollo + AcademyProvider + safe-area + Stack
│   ├── academy.tsx               # Academy picker (white-label tenant selection)
│   ├── login.tsx                 # White-labeled student sign-in screen
│   ├── dependents.tsx            # Guardian's children roster
│   └── (tabs)/
│       ├── _layout.tsx           # Custom tab bar with lucide icons (BrandedTabBar)
│       ├── index.tsx             # Dashboard (home)
│       ├── schedule.tsx          # Agenda (weekly + per-day class list)
│       ├── workouts.tsx          # Treinos (ficha atual + próximas + histórico)
│       ├── payments.tsx          # Finanças (próxima cobrança + histórico)
│       └── profile.tsx           # Perfil (dados + avaliações)
├── components/
│   ├── Skeleton.tsx              # Animated skeleton placeholder
│   ├── PlaceholderScreen.tsx     # Shared "em breve" layout for unwired tabs
│   ├── ScheduleWeekView.tsx      # Shared agenda body (tab + dependent agenda)
│   └── DependentForm.tsx         # Shared add/edit dependent form (+ photo)
├── hooks/
│   ├── useDashboard.ts           # Single data entrypoint — mock or Apollo
│   ├── useScheduleWeek.ts        # Agenda — weekly grid + book/cancel
│   ├── useDependentSchedule.ts   # Dependent agenda — book on their behalf
│   ├── useWorkouts.ts            # Treinos — active/upcoming/history/stats
│   ├── usePayments.ts            # Finanças — charges + next bill + banner
│   ├── useProfile.ts             # Perfil — me + avaliações + editable form
│   ├── useDependents.ts          # Guardian's roster + add/update (Fase 6)
│   ├── usePoolActivities.ts      # Piscina — pool fichas (category 'pool')
│   ├── usePoolStatus.ts          # Piscina — water quality (latest reading, Fase 8)
│   ├── useNotifications.ts       # Inbox + badge (polling, mark-read)
│   ├── usePushRegistration.ts    # Expo push: permission + token + register (7e)
│   └── useModuleGuard.ts         # Redirect home if a module is disabled
├── lib/
│   ├── apollo.ts                 # Apollo Client (httpLink + authLink)
│   ├── apollo-provider.tsx       # Mock-aware provider (pass-through in demo mode)
│   ├── academy.ts                # Active-academy slug persistence (SecureStore)
│   ├── academy-provider.tsx      # AcademyProvider / useActiveAcademy (Fase 9)
│   ├── slug.ts                   # normalizeSlug() — pure, unit-tested
│   ├── config.ts                 # EXPO_PUBLIC_* env reader, USE_MOCKS flag
│   ├── modules.ts                # hasModule() — per-academy module gating
│   ├── mock-data.ts              # Fixtures for demo mode
│   ├── theme.ts                  # Paper/ink palette + withAlpha helper
│   └── types.ts                  # Domain shape consumed by every screen
├── graphql/                      # .graphql query files (codegen target)
├── gql/                          # Generated types (committed)
├── assets/                       # Default icons, splash, fonts
├── app.json
├── codegen.ts
└── tsconfig.json
```

### Scaffolded since

- ✅ `/academy` picker + `AcademyProvider` (white-label tenant selection, Fase 9)
- ✅ `lib/auth.ts` (login/activate + SecureStore JWT), `lib/format.ts`
  (currency + date helpers)
- Push lives in `hooks/usePushRegistration.ts` (no separate
  `lib/notifications.ts` was needed)

## White-label theming

Neutral tokens (paper / ink / line / emerald) live in `lib/theme.ts` as
a plain `const` object — imported by every screen and the custom tab
bar. The per-academy accent color arrives via the dashboard query and
is threaded through props: `useDashboard()` returns
`data.academy.primaryColor`, which the dashboard and the tab bar both
read. No context provider is needed yet — Apollo's normalized cache
deduplicates the second `useDashboard()` call in the tab bar.

```ts
// lib/theme.ts
export const theme = {
  paper: '#faf8f5',
  ink900: '#0c0a09',
  ink300: '#a8a29e',
  line: '#e7e2d9',
  // ...etc
} as const;

export function withAlpha(hex: string, alpha: number): string {
  // Used for accent-tinted icon backdrops — the quick-actions row and
  // the workout icon box both rely on this.
}
```

**Which academy (the active slug)** is chosen at runtime in the `/academy`
picker and persisted in SecureStore via `AcademyProvider`
(`lib/academy-provider.tsx`), falling back to a baked
`EXPO_PUBLIC_ACADEMY_SLUG` for single-tenant builds. `useActiveAcademy()`
exposes `{ slug, ready, canSwitch, setSlug, clearSlug }`; the tabs entry gate
sends a fresh install to the picker before login. Pre-auth branding
(`useAcademyBranding`) reads that slug → `academyBySlug`; once logged in the
dashboard query (`MyDashboard`) carries the academy. `normalizeSlug`
(`lib/slug.ts`, pure + unit-tested) accepts a slug, deep link, or URL. See
design-decisions §2.18.

`mockups/student-dashboard.html` is the visual reference — note the
phone-frame layout, the way the header colour cascades into the card
borders and bottom-nav active state.

## Apollo Client + Codegen

Identical pipeline to the website — GraphQL-only, documentId-keyed
normalized cache, codegen from the canonical backend SDL — with two
differences for native:

1. **JWT storage** uses `expo-secure-store` (iOS keychain / Android
   EncryptedStore), not `localStorage`. Secrets belong in the keychain.
2. **Auth middleware is async** because SecureStore reads are async. The
   `ApolloLink` uses `Observable` to await the token before forwarding
   the operation.

### Files

- **`lib/apollo.ts`** — the Apollo Client instance, auth middleware, and
  the `setAuthToken` / `clearAuthToken` helpers that call SecureStore +
  invalidate the Apollo cache on logout.
- **`codegen.ts`** — `@graphql-codegen/cli` config with the `client`
  preset. Reads `../backend/schema.graphql`, scans `graphql/**/*.graphql`
  + all `.ts`/`.tsx` files. Writes `gql/` at the repo root (Expo's Metro
  doesn't mind, and we don't use a `src/` folder here).
- **`graphql/*.graphql`** — one file per domain. `academy.graphql`
  ships with the public `AcademyBySlug` query, the authenticated
  `MyDashboard` query (the single round-trip that powers the home tab)
  and the `CheckInBooking` mutation.

### How to add a new query

Same as the website — either add it to a `.graphql` file or inline it in
a component with the generated `graphql()` helper, then run
`npm run codegen`. The generated types appear in `gql/` and are
committed.

```tsx
import { useQuery } from '@apollo/client/react';
import { graphql } from '../gql';

const MY_DASHBOARD = graphql(`
  query MyDashboard { me { documentId name academy { primaryColor } } }
`);

export function DashboardScreen() {
  const { data, loading } = useQuery(MY_DASHBOARD);
  // data.me is fully typed.
}
```

## Screens

| Route | Description | Status |
|---|---|---|
| `/academy` | Academy picker — choose tenant on first launch (Fase 9) | ✅ |
| `/login` | Student login (white-labeled) | ✅ |
| `/(tabs)` | Dashboard — next class, payment status, current workout | ✅ |
| `/(tabs)/schedule` | Weekly schedule, book / cancel classes | ✅ |
| `/(tabs)/workouts` | Active workout + history | ✅ |
| `/(tabs)/payments` | Payment history, pending charges, receipts | ✅ |
| `/(tabs)/profile` | Personal info, body assessments, settings | ✅ |
| `/(tabs)/pool` | Piscina — water-quality card (Fase 8) + pool fichas | ✅ |
| `/dependents` | Guardian's dependents roster (responsável) | ✅ |
| `/dependent/new` | Register a new dependent (guardian) | ✅ |
| `/dependent/[id]/edit` | Edit a dependent (whitelisted fields + photo) | ✅ |
| `/dependent/[id]/schedule` | Book classes on a dependent's behalf | ✅ |
| `/workout/[id]` | Workout plan detail (exercises) + "Iniciar treino" | ✅ |
| `/workout/session/[id]` | Live execution: timer, checklist, finish/cancel | ✅ |
| `/booking/[id]` | Class booking detail (room, instructor, capacity) | ✅ |
| `/payment/[id]` | Checkout — PIX / boleto / cartão tabs (mocked gateway) | ✅ |
| `/profile/edit` | Edit profile — phone/address/gender/birthdate + photo upload | ✅ |
| `/profile/password` | Change password (atual + nova) | ✅ |
| `/notifications` | Inbox in-app (badge real, polling, mark-read, deep-link) | ✅ |

## Module gating

The app shows only the modules the academy enabled
(`Academy.enabledModules`, toggled in the admin). `MyDashboard` selects
`academy.enabledModules`; `lib/modules.ts → hasModule()` drives tab
visibility (`(tabs)/_layout.tsx`: Agenda/Treinos/Piscina), the dashboard
cards + quick-actions, and the dependents entry. `hooks/useModuleGuard`
bounces a deep link to a disabled screen home. **null/unset = all on.**
The backend `requireModule` enforces the same on the API. See
design-decisions §2.13.

## Push notifications

`expo-notifications` is wired to:
- Class reminders (1 hour before each booking)
- Payment due (3 days before, 1 day before, on overdue)
- Workout updates (when an instructor publishes a new ficha)

The push token is sent to the backend on login → stored on the User record
(custom field on `users-permissions.user`) → the backend can broadcast
via Expo Push API on lifecycle events.

## OTA updates (EAS Update)

EAS Update is enabled so JS-only changes ship without going through the
app stores. The release channels are:
- `production` — stable release
- `staging` — what's about to ship
- `dev` — internal builds

```bash
eas update --branch production --message "fix payment receipt formatting"
```

### Authenticating on a server (`EXPO_TOKEN`)

Serving the dev bundle via the Docker image (`expo start --go`) is
anonymous — it does not need an Expo login. But any EAS call (`eas
update`, `eas build`, `eas submit`) does.

**Never run interactive `expo login` inside a container**: the
credentials land in `/root/.expo/state.json`, which is lost on every
container rebuild. Use a personal access token instead.

1. Generate a token at
   <https://expo.dev/settings/access-tokens>. The value is shown once
   — paste it into the server's `.env`, **not** the repo.
2. `.env.example` declares `EXPO_TOKEN=` (empty). Fill it in on the
   server only.
3. `docker run --env-file .env ...` (or the equivalent compose
   `env_file:`) forwards it into the container. The `Dockerfile`
   declares `ENV EXPO_TOKEN=""` so the variable exists but the real
   value is never baked into an image layer.
4. The entrypoint prints `expo auth = token present (N chars)` at
   boot so you can confirm it arrived without exposing the value.
5. Every subsequent `docker exec <container> npx eas ...` call is
   auto-authenticated — the CLI reads `EXPO_TOKEN` before falling
   back to any on-disk state.

### Two-domain layout for the dev server (`PUBLIC_HOST` + `METRO_PUBLIC_URL`)

The Docker image runs **two** services on different ports and expects
two public hostnames fronted by Traefik/Dokploy:

| Port | Service | Role | Env var |
|---|---|---|---|
| 80   | `busybox-extras httpd` | QR-code landing page (HTML + PNG) | `PUBLIC_HOST` |
| 8081 | `expo start --host lan` | Metro bundler — Expo Go connects here | `METRO_PUBLIC_URL` |

The landing page lives on the "bare" hostname (e.g. `expo.gym.app`)
and the bundler lives on a sub-hostname (e.g. `expo.app.gym.app`). In
Dokploy add two routers for the same service:

1. `expo.gym.app` → container port **80**, HTTPS via Let's Encrypt
2. `expo.app.gym.app` → container port **8081**, HTTPS via Let's Encrypt

Then set the env vars on the service:

```env
PUBLIC_HOST=expo.gym.app
METRO_PUBLIC_URL=https://expo.app.gym.app
```

When `METRO_PUBLIC_URL` is set, the entrypoint exports
`EXPO_PACKAGER_PROXY_URL=$METRO_PUBLIC_URL` — this is the undocumented
knob in `@expo/cli`'s `UrlCreator.js` that tells Metro to advertise
that exact URL as the manifest URL, with **no port appended**. The QR
code PNG on the landing page also encodes the HTTPS URL, so scanning
it in Expo Go jumps straight to the bundler without `:8081`.

If `METRO_PUBLIC_URL` is not set, the entrypoint falls back to the
legacy `exp://${PUBLIC_HOST}:8081` URL and you have to expose port
8081 publicly. Use the two-domain mode whenever TLS is available —
Expo Go refuses self-signed certs, so Traefik must have a valid
Let's Encrypt cert for both hostnames before phones will connect.

## SEO / discoverability

Native apps don't index in Google, but the app **does** export a static
web build via `expo export --platform web` which can host the marketing
demo at `app.gym.app/demo`. That static export is `noindex, nofollow` —
the marketing site (`website/`) is the only SEO-relevant surface.

## UI/UX Notes

- **Mobile-first.** Design at 390 × 844 (iPhone 14 Pro logical), scale gracefully
- **Touch targets ≥ 44 × 44 pt** (Apple HIG)
- **Safe area:** wrap every screen in `<SafeAreaView edges={['top']}>` so
  content clears the notch
- **Language:** PT-BR
- **Date format:** `DD/MM/YYYY` (`date-fns/locale/pt-BR`)
- **Currency:** `R$ 1.234,56` (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`)
- **Bottom nav** (5 tabs): Início / Agenda / Treinos / Finanças / Perfil
- The header always shows the academy's logo + name (so the student
  knows whose app they're in)
- **Loading:** Skeleton placeholders matching the actual layout
- **Errors:** Inline `Toast` (use `react-native-toast-message`) with
  retry actions — never silent

## Implementation Order

- [x] `create-expo-app` with the blank TypeScript template
- [x] Apollo Client 4 + GraphQL codegen
- [x] Mock-vs-API toggle (`EXPO_PUBLIC_USE_MOCKS`)
- [x] Dashboard screen (mirrors `mockups/student-dashboard.html`)
- [x] expo-router + `(tabs)` layout with a custom `BrandedTabBar`
- [x] lucide-react-native icons everywhere (no more emoji)
- [ ] Login screen + secure JWT storage (SecureStore wrappers)
- [ ] Academy picker + proper `WhiteLabelProvider`
- [ ] Schedule tab content (weekly calendar + booking flow)
- [ ] Workouts tab content (list + detail)
- [ ] Payments tab content (history + receipt)
- [ ] Profile tab content (settings, body assessments)
- [ ] Push notifications wiring
- [ ] EAS build + OTA update channels
