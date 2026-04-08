# Gym — Student App (White-Label)

The mobile-first student-facing app. One Next.js project, but each academy
gets a fully white-labeled experience: their logo, their colors, their
subdomain.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS** + CSS variables (the variables are set per academy at
  runtime — that's how white-labeling works)
- **Apollo Client 4**
- **shadcn/ui**
- **React Hook Form + Zod**
- **date-fns** (PT-BR locale)
- **next-pwa** (optional — install when we want offline / installable)

## Setup

```bash
cd app
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install @apollo/client@4 graphql zod react-hook-form @hookform/resolvers date-fns
npx shadcn@latest init
```

## Structure

```
app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root: Apollo, fonts, default theme
│   │   ├── [subdomain]/            # Catch-all per academy
│   │   │   ├── layout.tsx          # WhiteLabelProvider wraps everything
│   │   │   ├── page.tsx            # Student dashboard
│   │   │   ├── login/
│   │   │   ├── schedule/
│   │   │   ├── workouts/
│   │   │   ├── payments/
│   │   │   └── profile/
│   │   ├── sitemap.ts              # noindex anyway, but kept for hygiene
│   │   ├── robots.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── academy/                # WhiteLabelProvider, BrandHeader, …
│   │   ├── schedule/               # Calendar, BookingCard, CapacityBar
│   │   ├── workouts/               # WorkoutCard, ExerciseRow
│   │   └── payments/               # PaymentBadge, PaymentRow
│   ├── lib/
│   │   ├── apollo.ts
│   │   ├── auth.ts
│   │   ├── theme.ts                # CSS variable injection helper
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAcademy.ts           # Wraps Query.academyBySlug
│   │   ├── useMe.ts                # Wraps Query.me
│   │   └── useBookings.ts
│   └── middleware.ts               # Subdomain → /[subdomain]/...
└── public/
```

## Subdomain routing

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'gym.app';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const subdomain = host.split('.')[0];

  // Skip the apex/www — those are reserved for the marketing site,
  // which is hosted separately on website/.
  if (host === APP_DOMAIN || host === `www.${APP_DOMAIN}` || subdomain === 'localhost') {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## White-label theming

Theming is done with CSS variables that are injected on every page load
based on the academy's branding config. The `Query.academyBySlug` query
is `auth: false` precisely so the layout can fetch it on every request
without a valid JWT.

```css
/* globals.css */
:root {
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  --color-secondary: #8b5cf6;
}
```

```tsx
// src/components/academy/WhiteLabelProvider.tsx
'use client';

import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ACADEMY_BY_SLUG } from '@/graphql/academy';

export function WhiteLabelProvider({
  subdomain,
  children,
}: {
  subdomain: string;
  children: React.ReactNode;
}) {
  const { data } = useQuery(ACADEMY_BY_SLUG, { variables: { slug: subdomain } });

  useEffect(() => {
    const academy = data?.academyBySlug;
    if (!academy) return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', academy.primaryColor);
    root.style.setProperty('--color-secondary', academy.secondaryColor);
  }, [data]);

  return <>{children}</>;
}
```

`mockups/student-dashboard.html` is the visual reference — note the
phone-frame layout and the way `--primary` cascades into every accent
(class card, exercise badges, bottom-nav active state).

## Pages

| Path | Description |
|---|---|
| `/[subdomain]` | Dashboard — next class, payment status, current workout |
| `/[subdomain]/login` | Student login (white-labeled) |
| `/[subdomain]/schedule` | Weekly calendar, book / cancel classes |
| `/[subdomain]/workouts` | Active workouts + history |
| `/[subdomain]/payments` | Payment history, pending charges, receipts |
| `/[subdomain]/profile` | Personal info, body assessments, settings |

## Apollo Client

Identical to the website — same `apolloClient` setup with JWT in
localStorage. The only difference is that on the dashboard / schedule /
payments queries, the token is required (these resolve through
`Query.me`-style protected resolvers), while the initial `academyBySlug`
load is unauthenticated.

## SEO

Every student-facing page is `noindex, nofollow` — these are private
authenticated experiences and shouldn't appear in search results. The
robots config blocks all crawlers.

The only exception is the `/[subdomain]` landing screen if/when an academy
opts into a public "preview" page — in that case, generate per-academy
metadata and a JSON-LD `LocalBusiness` snippet from the academy's data.

## PWA / installable

Out of scope for v1 but the structure is ready: add `next-pwa`, drop a
manifest.json (with the academy's logo as the icon — generated at build
time when we have a small set of academies, or runtime via `[subdomain]`
metadata for many), and expose an "Install app" prompt on the dashboard.

## UI/UX Notes

- **Mobile-first.** Design at 390px (iPhone Pro), scale up gracefully.
- **Touch targets ≥ 44px.**
- Language: PT-BR
- Date format: `DD/MM/YYYY`
- Currency: `R$ 1.234,56`
- The header always shows the academy logo + name (so the student knows
  whose app they're in)
- Bottom nav: Início / Agenda / Treinos / Finanças / Perfil
- Loading: shadcn `Skeleton`
- Errors: shadcn `Sonner`
