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

- **Expo SDK 51+** (React Native)
- **TypeScript** (strict)
- **expo-router** (file-system routing — same mental model as Next.js)
- **Apollo Client 4** + `graphql` — every data call goes through GraphQL
- **NativeWind** (Tailwind for React Native) for styling
- **react-native-reanimated** + `react-native-gesture-handler` for motion
- **expo-secure-store** for the JWT (NOT AsyncStorage — secrets belong in the keychain)
- **expo-notifications** for class reminders + payment alerts
- **expo-image** for fast image rendering
- **react-hook-form** + `zod` for forms
- **date-fns** with the `pt-BR` locale

## Setup

```bash
cd app
npx create-expo-app@latest . --template tabs   # picks expo-router + ts + tabs
npm install @apollo/client@4 graphql zod react-hook-form @hookform/resolvers \
            date-fns nativewind expo-secure-store expo-notifications expo-image
npx tailwindcss init                            # NativeWind config
```

`app.json` should set:
- `expo.scheme` (deep links, e.g. `gymapp`)
- `expo.web.bundler = "metro"`
- `expo.notification` icon + color (per default branding)
- `expo.ios.bundleIdentifier = "app.gym.student"`
- `expo.android.package = "app.gym.student"`

## Structure

```
app/
├── app/                          # expo-router (file-based)
│   ├── _layout.tsx               # Root: Apollo provider, theme provider, fonts
│   ├── index.tsx                 # Subdomain picker / academy not selected
│   ├── (academy)/
│   │   ├── _layout.tsx           # WhiteLabelProvider (fetches academyBySlug)
│   │   ├── login.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx       # Bottom tab bar
│   │   │   ├── index.tsx         # Dashboard
│   │   │   ├── schedule.tsx
│   │   │   ├── workouts.tsx
│   │   │   ├── payments.tsx
│   │   │   └── profile.tsx
│   │   ├── workout/[id].tsx      # Workout detail
│   │   ├── booking/[id].tsx      # Class booking detail
│   │   └── payment/[id].tsx      # Payment receipt detail
│   └── +not-found.tsx
├── components/
│   ├── BrandHeader.tsx           # Academy logo + name (themed)
│   ├── ClassCard.tsx
│   ├── PaymentBadge.tsx
│   ├── WorkoutCard.tsx
│   ├── ExerciseRow.tsx
│   └── ui/                       # Buttons, Cards, Inputs (NativeWind primitives)
├── lib/
│   ├── apollo.ts                 # Apollo Client (httpLink + authLink)
│   ├── auth.ts                   # SecureStore wrappers
│   ├── theme.tsx                 # ThemeProvider — sets per-academy colors
│   ├── notifications.ts          # expo-notifications helpers
│   └── format.ts                 # Currency / date formatters (pt-BR)
├── hooks/
│   ├── useAcademy.ts             # Wraps Query.academyBySlug
│   ├── useMe.ts                  # Wraps Query.me
│   └── useBookings.ts
├── graphql/                      # .graphql query files (codegen target)
├── assets/                       # Default icons, splash, fonts
├── app.json
├── tailwind.config.js            # NativeWind
├── babel.config.js
└── tsconfig.json
```

## White-label theming

The app reads the academy slug from one of:
1. A deep link query param (`gymapp://?slug=crossfit-sp`)
2. A previously-stored value in SecureStore (`academy_slug`)
3. The login screen's "select your academy" picker (apex case)

It then calls the public `Query.academyBySlug` (no auth required — that's
why the resolver is the only `auth: false` entry in the GraphQL schema)
and applies the result to a `ThemeProvider`. NativeWind picks up the
colors from CSS variables on web and from a `useTheme()` hook on native.

```ts
// lib/theme.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { ACADEMY_BY_SLUG } from '@/graphql/academy';

const DEFAULT_THEME = {
  primary: '#0c0a09',
  primaryDark: '#000',
  primaryContrast: '#ffffff',
  paper: '#faf8f5',
};

export const ThemeContext = createContext(DEFAULT_THEME);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const { data } = useQuery(ACADEMY_BY_SLUG, { variables: { slug } });
  const academy = data?.academyBySlug;

  const theme = academy
    ? {
        primary: academy.primaryColor,
        primaryDark: shade(academy.primaryColor, -0.15),
        primaryContrast: contrastOn(academy.primaryColor),
        paper: '#faf8f5',
      }
    : DEFAULT_THEME;

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
```

`mockups/student-dashboard.html` is the visual reference — note the
phone-frame layout, the way the header colour cascades into the card
borders and bottom-nav active state.

## Apollo Client

Same setup as the website, but the JWT is stored in `expo-secure-store`
instead of `localStorage`:

```ts
// lib/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as SecureStore from 'expo-secure-store';

const httpLink = new HttpLink({ uri: process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT });

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('jwt');
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Academy: { keyFields: ['documentId'] },
      Student: { keyFields: ['documentId'] },
      ClassSchedule: { keyFields: ['documentId'] },
      ClassBooking: { keyFields: ['documentId'] },
      WorkoutPlan: { keyFields: ['documentId'] },
      Payment: { keyFields: ['documentId'] },
    },
  }),
});
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

1. `npx create-expo-app` with the tabs template
2. NativeWind + theme provider + Apollo Client
3. Login screen + secure JWT storage
4. White-label theming (academyBySlug query → ThemeProvider)
5. Dashboard tab (mirrors `mockups/student-dashboard.html`)
6. Schedule tab (weekly calendar + booking flow)
7. Workouts tab (list + detail)
8. Payments tab (history + receipt)
9. Profile tab (settings, body assessments)
10. Push notifications wiring
11. EAS build + OTA update channels
