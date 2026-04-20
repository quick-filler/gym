# Gym — Website (Marketing + Admin)

The public-facing landing site and the academy admin panel. Both live in the
same Next.js project because they share branding, components, and the
authenticated session for admins coming straight from `/login`.

## Stack

- **Next.js 16** (App Router, Turbopack) — pinned to whatever
  `create-next-app@latest` picked (16.2.x at scaffold time)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** + CSS variables via `@theme` in `globals.css`
- **Apollo Client 4** — every data call goes through GraphQL (or mocks in demo mode)
- **@graphql-codegen/cli** + `@graphql-codegen/client-preset` — fully typed
  `graphql()` function generated from the backend's SDL
- **Fonts**: Outfit (display), Geist (body), JetBrains Mono (mono) via `next/font`
- **UI primitives**: hand-rolled (`src/components/ui/`) using Tailwind utilities
  and the paper/ink/flame design tokens. No shadcn/ui dependency yet —
  the mockup-driven aesthetic is too opinionated to get value from it.

> Why Apollo (not TanStack Query)? The backend exposes GraphQL only — see
> [`backend/CLAUDE.md → GraphQL Schema`](../backend/CLAUDE.md#graphql-schema).
> Apollo's normalized cache is a better fit than rebuilding the same
> machinery on top of plain `fetch`. Decision documented in
> [`docs/design-decisions.md §3.1 / §4.2`](../docs/design-decisions.md).

## Setup (fresh clone)

```bash
cd website
npm install
cp .env.local.example .env.local    # defaults ship in demo mode
npm run codegen                     # generates src/gql/
npm run dev                         # http://localhost:9999
```

Demo mode (`NEXT_PUBLIC_USE_MOCKS=true`) is the default so a fresh clone
renders the entire UI — marketing and admin — without booting the
backend. See [Demo mode](#demo-mode) below for how to switch to the real
Strapi GraphQL API.

## Structure

```
website/
├── src/
│   ├── app/
│   │   ├── (marketing)/        # Public landing pages — route group with Nav + Footer
│   │   │   ├── page.tsx        # /
│   │   │   ├── pricing/page.tsx + PricingClient.tsx
│   │   │   ├── features/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx + ContactForm.tsx
│   │   │   └── layout.tsx      # Nav + MarketingFooter
│   │   ├── admin/              # Authenticated admin panel (noindex)
│   │   │   ├── page.tsx        # redirect → /admin/dashboard
│   │   │   ├── dashboard/
│   │   │   ├── students/
│   │   │   ├── finance/
│   │   │   ├── schedule/
│   │   │   ├── settings/
│   │   │   └── layout.tsx      # Sidebar + topbar shell
│   │   ├── login/              # Split-screen login (outside marketing group)
│   │   │   └── page.tsx + LoginClient.tsx
│   │   ├── layout.tsx          # Root (fonts, Apollo provider, metadata)
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── globals.css         # Tailwind v4 @theme with paper/ink/flame tokens
│   ├── components/
│   │   ├── ui/                 # Primitives: Button, Card, Pill, Icon, Field, …
│   │   ├── marketing/          # Nav, Footer, Wrap
│   │   └── admin/              # Sidebar, Topbar, PageHeader, MetricCard, Avatar, StatusPill
│   ├── lib/
│   │   ├── apollo.ts           # Apollo Client (httpLink + authLink)
│   │   ├── apollo-provider.tsx # Pass-through in mock mode, ApolloProvider otherwise
│   │   ├── config.ts           # USE_MOCKS, GRAPHQL_ENDPOINT, SITE_ORIGIN, APP_DOMAIN
│   │   ├── types.ts            # Domain model shapes (decoupled from GraphQL)
│   │   ├── mock-data.ts        # Typed fixtures matching the Gym Demo seed
│   │   ├── hooks.ts            # useDashboard / useStudents / … (mock-or-API branching)
│   │   ├── seo.tsx             # pageMetadata(), JsonLd, Organization + FAQ schemas
│   │   └── utils.ts            # cn(), formatBRL(), formatDate()
│   ├── graphql/                # .graphql query files (codegen target)
│   └── gql/                    # Generated GraphQL types (committed)
└── public/
    ├── icons.svg               # SVG sprite (ported from mockups/_icons.svg)
    └── llms.txt                # LLM-search crawler guidance
```

## Demo mode

The website ships with a **mock-vs-API toggle** that mirrors the `app/`
project pattern so a fresh clone renders the full UI — marketing pages,
admin dashboard, students, finance, schedule, settings — without a
running Strapi backend.

- **Flag**: `NEXT_PUBLIC_USE_MOCKS` (default `true`).
- **Config**: `src/lib/config.ts` reads the env var at build time.
  Because Next.js inlines `NEXT_PUBLIC_*` vars, you must restart the dev
  server after flipping the flag.
- **Provider**: `src/lib/apollo-provider.tsx` degrades to a React
  pass-through in mock mode so Apollo's client never runs against a
  missing endpoint. The real `ApolloProvider` is only mounted when
  `USE_MOCKS=false`.
- **Hooks**: `src/lib/hooks.ts` exposes `useDashboard`, `useStudents`,
  `useFinance`, `useSchedule`, `useAcademy`, `usePricingPlans`. Each
  returns a stable `DataSourceResult<T>` shape (`{ data, loading, error,
  refetch? }`) regardless of branch. The API-mode branches are stubs
  today — they return a clear error. Wiring them to Apollo `useQuery`
  calls is the last-mile work once the backend list resolvers are
  locked.
- **Fixtures**: `src/lib/mock-data.ts` holds typed objects
  (`MOCK_DASHBOARD`, `MOCK_STUDENTS`, `MOCK_FINANCE`, …) whose identity
  (`Gym Demo`) matches the `SEED_DEMO=true` academy, so switching modes
  against a seeded backend should show the same data set.
- **Login**: in mock mode, `/login` accepts any credentials and drops
  `gym_jwt=mock-demo-token` into `localStorage`, then redirects to
  `/admin/dashboard`. In API mode, it POSTs to `/api/auth/local` on the
  Strapi users-permissions plugin.
- **Why this shape?** See
  [docs/design-decisions.md §14](../docs/design-decisions.md).

## Apollo Client + Codegen

The data pipeline is wired end-to-end and verified by a working
`npm run build`:

- **`src/lib/apollo.ts`** — `ApolloClient` with an `HttpLink` pointing at
  `NEXT_PUBLIC_GRAPHQL_ENDPOINT` and an `ApolloLink` middleware that
  reads the JWT from `localStorage` and attaches it as
  `Authorization: Bearer …`. Cache is `InMemoryCache` with explicit
  `keyFields: ['documentId']` for every content type.
- **`src/lib/apollo-provider.tsx`** — `'use client'` wrapper exposing
  `<ApolloClientProvider>`. Wired into `src/app/layout.tsx`.
- **`codegen.ts`** — `@graphql-codegen/cli` config with the `client`
  preset. Reads `../backend/schema.graphql` (emitted at every Strapi
  boot, tracked in git) and scans `src/**/*.{ts,tsx}` +
  `src/graphql/**/*.graphql`. Writes `src/gql/` which is the import
  surface for every typed operation.
- **`src/graphql/*.graphql`** — one file per domain. Ships today with
  `academy.graphql` (public `AcademyBySlug` + authenticated `Academies`)
  and `students.graphql` (admin student list + detail + create).

### How to add a new query

```tsx
import { useQuery } from '@apollo/client/react';
import { graphql } from '@/gql';

const ACADEMIES_LIST = graphql(`
  query AcademiesList {
    academies { documentId name slug plan }
  }
`);

export function AcademiesList() {
  const { data, loading } = useQuery(ACADEMIES_LIST);
  // data is fully typed — no annotations, no casts.
}
```

Then run `npm run codegen` (or `npm run codegen:watch` alongside
`npm run dev`). The generated types appear in `src/gql/` and are
committed — fresh clones don't need to re-run codegen just to build.

### Why a committed SDL file, not introspection

- Fresh clones can run `npm run codegen` without booting Strapi first.
- CI can type-check the website without a running backend.
- Schema diffs show up as line diffs in PRs — API changes are reviewable.

When the backend schema changes, boot Strapi once (or run `npm run build`
in `backend/`) and the artifact is regenerated at
`backend/schema.graphql`. Commit the diff alongside the code change.

## Pages (marketing) — all implemented

| Path | Description | Status |
|---|---|---|
| `/` | Landing — hero, trust bar, bento features, how-it-works, pricing preview, testimonials, FAQ, CTA banner | ✅ |
| `/pricing` | 3 plans + monthly/annual toggle + comparison table + FAQ | ✅ |
| `/features` | 5 zig-zag feature rows with live visuals (finance, schedule, workouts, white-label, reports) | ✅ |
| `/about` | Stats grid + story + values + team | ✅ |
| `/contact` | Split layout with channels + client-side contact form (mock submission) | ✅ |
| `/login` | Split-screen login with SSO buttons, demo-mode banner | ✅ |

Every marketing page ships JSON-LD (Organization / SoftwareApplication /
FAQPage / AboutPage / ContactPage) via `src/lib/seo.tsx → JsonLd`.

## Pages (admin) — all implemented

| Path | Description | Status |
|---|---|---|
| `/admin` | Redirects to `/admin/dashboard` | ✅ |
| `/admin/dashboard` | 4 metric cards + recent students table + today's classes + upcoming payments | ✅ |
| `/admin/students` | Filter chips + search + students table with status pills and payment method | ✅ |
| `/admin/finance` | 4 KPI cards (first highlighted) + charges table + payment method breakdown with bar charts | ✅ |
| `/admin/dre` | Revenue/expenses/profit hero, 6-month cashflow SVG chart, expense category breakdown, expenses table | ✅ |
| `/admin/dependents` | Info banner + auto-fill family card grid (guardian + dependents + status/allergy alerts) | ✅ |
| `/admin/schedule` | Week navigator + 7-column weekly grid + side stats + upcoming classes | ✅ |
| `/admin/workouts` | Tabs (Ativas / Avaliações / Arquivadas) + workout plan card grid (exercises + sets/reps/load + student tag) | ✅ |
| `/admin/settings` | Identity/Appearance/Integration tabs + live white-label phone preview | ✅ |
| `/admin/students/[id]` | Student detail | — future |
| `/admin/plans` | Plans CRUD | — future |

Admin routes are marked `robots: { index: false, follow: false }` via
`src/app/admin/layout.tsx`.

## SEO

The marketing pages target organic search for Brazilian gym owners — the
primary keyword cluster is "sistema de gestão de academia" / "software
academia" / "app aluno academia".

- `metadata` per route via Next.js `generateMetadata` + `src/lib/seo.ts`
- Structured data (JSON-LD) on every public page:
  - Landing: `Organization` + `SoftwareApplication`
  - Pricing: `Product` + `Offer` for each plan
  - About: `AboutPage`
  - Contact: `ContactPage` + `LocalBusiness` (when applicable)
- Open Graph + Twitter Card images served from `public/og/`
- `app/sitemap.ts` and `app/robots.ts` (Next.js 14 idiomatic)
- Canonical URLs on every page
- Semantic HTML5 (`<header>`, `<main>`, `<article>`, `<section>`, `<footer>`)
- Image optimization via `next/image` with explicit width/height (no CLS)
- `lang="pt-BR"` on the root layout

The admin panel is `noindex, nofollow` since it's authenticated.

## Design system

Ported from `mockups/design-system.css` into Tailwind v4 via `@theme` in
`src/app/globals.css`. The palette is intentionally warm (paper / ink /
flame) — not the scaffold's default indigo. Key tokens:

- **Colors**: `paper-50/paper/paper-2/paper-3`, `ink-50/200/300/400/500/600/700/900`,
  `flame/flame-dark/flame-50/flame-100`, `pine/pine-50`,
  `emerald/rose/amber/sky`, `line/line-strong`
- **Radii**: `--radius-sm: 10px`, `--radius: 16px`, `--radius-lg: 28px`, `--radius-xl: 40px`
- **Shadows**: `--shadow-gym-1/2/3` (tinted warm, never pure black)
- **Fonts**: `--font-display` (Outfit), `--font-sans` (Geist), `--font-mono` (JetBrains Mono)

The website itself uses the Gym brand palette. Per-academy white-label
theming lives in the **app/** project — see
[`app/CLAUDE.md`](../app/CLAUDE.md). The admin settings page renders a
live phone preview that reads `primaryColor` + `secondaryColor` from the
`useAcademy` hook to simulate the white-label effect.

## Implementation Order

1. ✅ Project scaffold + Apollo Client + codegen
2. ✅ Design tokens in `globals.css` + UI primitives in `src/components/ui/`
3. ✅ Demo mode (`config.ts` + `types.ts` + `mock-data.ts` + `hooks.ts`)
4. ✅ Marketing layout + all marketing pages (landing, pricing, features, about, contact)
5. ✅ `/login` (demo-accepting in mock mode, REST auth in API mode)
6. ✅ Admin layout + admin pages (dashboard, students, finance, schedule, settings)
7. ✅ `sitemap.ts`, `robots.ts`, `llms.txt`, `seo.tsx` helpers with JSON-LD
8. ⏳ Wire `src/lib/hooks.ts` API branches to Apollo `useQuery` (once backend list resolvers are locked)
9. ⏳ `/admin/students/[id]`, `/admin/plans`
10. ⏳ OG images under `public/og/`

## UI/UX Notes

- Language: **PT-BR** throughout
- Date format: `DD/MM/YYYY` (formatted via `src/lib/utils.ts → formatDate`)
- Currency: `R$ 1.234,56` (formatted via `formatBRL`)
- Mobile-first marketing, desktop-first admin
- Loading: inline text states today (skeletons are cheap to add per page later)
- Error: inline error text; no toasts yet — form success in contact uses
  an inline "Mensagem enviada" state
- Never use `window.alert/confirm/prompt` — use inline React state
