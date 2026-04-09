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
│   ├── _layout.tsx               # Root: Apollo provider + safe-area provider + Stack
│   └── (tabs)/
│       ├── _layout.tsx           # Custom tab bar with lucide icons (BrandedTabBar)
│       ├── index.tsx             # Dashboard (home)
│       ├── schedule.tsx          # Agenda (placeholder)
│       ├── workouts.tsx          # Treinos (placeholder)
│       ├── payments.tsx          # Finanças (placeholder)
│       └── profile.tsx           # Perfil (placeholder)
├── components/
│   ├── Skeleton.tsx              # Animated skeleton placeholder
│   └── PlaceholderScreen.tsx     # Shared "em breve" layout for unwired tabs
├── hooks/
│   └── useDashboard.ts           # Single data entrypoint — mock or Apollo
├── lib/
│   ├── apollo.ts                 # Apollo Client (httpLink + authLink)
│   ├── apollo-provider.tsx       # Mock-aware provider (pass-through in demo mode)
│   ├── config.ts                 # EXPO_PUBLIC_* env reader, USE_MOCKS flag
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

### Still to scaffold

- `/login` route + `(academy)` group (white-label picker)
- `workout/[id]`, `booking/[id]`, `payment/[id]` detail routes
- `lib/auth.ts` (SecureStore wrappers), `lib/notifications.ts`,
  `lib/format.ts` (currency + date helpers)

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

Once we add the `/login` flow and the subdomain picker, theming will
graduate to a proper `WhiteLabelProvider` that fetches `academyBySlug`
from SecureStore-persisted state. Until then, the dashboard query
(`MyDashboard`) is the single source of truth for the active academy.

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

| Route | Description |
|---|---|
| `/login` | Student login (white-labeled) |
| `/(tabs)` | Dashboard — next class, payment status, current workout |
| `/(tabs)/schedule` | Weekly schedule, book / cancel classes |
| `/(tabs)/workouts` | Active workout + history |
| `/(tabs)/payments` | Payment history, pending charges, receipts |
| `/(tabs)/profile` | Personal info, body assessments, settings |
| `/workout/[id]` | Single workout detail (exercises, sets, reps, video?) |
| `/booking/[id]` | Class booking detail (room, instructor, capacity) |
| `/payment/[id]` | Payment receipt detail |

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
