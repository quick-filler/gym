# Gym — Website (Marketing + Admin)

The public-facing landing site and the academy admin panel. Both live in the
same Next.js project because they share branding, components, and the
authenticated session for admins coming straight from `/login`.

## Stack

- **Next.js 16** (App Router, Turbopack) — pinned to whatever
  `create-next-app@latest` picked (16.2.x at scaffold time)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** + CSS variables
- **Apollo Client 4** — every data call goes through GraphQL
- **@graphql-codegen/cli** + `@graphql-codegen/client-preset` — fully typed
  `graphql()` function generated from the backend's SDL
- **shadcn/ui** (to be added)
- **React Hook Form + Zod** (to be added)
- **date-fns** with PT-BR locale (to be added)

> Why Apollo (not TanStack Query)? The backend exposes GraphQL only — see
> [`backend/CLAUDE.md → GraphQL Schema`](../backend/CLAUDE.md#graphql-schema).
> Apollo's normalized cache is a better fit than rebuilding the same
> machinery on top of plain `fetch`. Decision documented in
> [`docs/design-decisions.md §3.1 / §4.2`](../docs/design-decisions.md).

## Setup (fresh clone)

```bash
cd website
npm install
cp .env.local.example .env.local    # override the endpoint if needed
npm run codegen                     # generates src/gql/
npm run dev                         # http://localhost:3000
```

Dependencies were installed during the initial scaffold
(`create-next-app@latest` + Apollo Client 4 + codegen). Additional
libraries (shadcn/ui, react-hook-form, date-fns) are added on-demand as
pages come online.

## Structure

```
website/
├── src/
│   ├── app/
│   │   ├── (marketing)/        # Public landing pages
│   │   │   ├── page.tsx        # /
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── layout.tsx
│   │   ├── admin/              # Authenticated admin panel
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── students/
│   │   │   ├── finance/
│   │   │   ├── schedule/
│   │   │   ├── plans/
│   │   │   ├── settings/
│   │   │   └── layout.tsx      # Sidebar + topbar
│   │   ├── layout.tsx          # Root (Apollo provider, fonts, theme)
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── marketing/          # Hero, Features, Pricing, FAQ, Footer, …
│   │   └── admin/              # Sidebar, MetricsCard, StudentTable, …
│   ├── lib/
│   │   ├── apollo.ts           # Apollo Client (httpLink + authLink)
│   │   ├── auth.ts             # JWT helpers
│   │   ├── seo.ts              # Metadata + JSON-LD helpers
│   │   └── utils.ts
│   ├── graphql/                # .graphql query files (codegen target)
│   └── types/                  # Generated GraphQL types
└── public/
```

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

## Pages (marketing)

| Path | Description |
|---|---|
| `/` | Landing — hero, features, how-it-works, pricing, testimonials, FAQ, CTA |
| `/pricing` | Detailed plan comparison + FAQ |
| `/features` | Feature deep-dive (one section per product surface) |
| `/about` | Story, team, values |
| `/contact` | Contact form (sales / support) |
| `/login` | Admin login |

## Pages (admin)

| Path | Description |
|---|---|
| `/admin/login` | Admin login (academy_admin role) |
| `/admin/dashboard` | Metrics overview (active students, MRR, overdue, classes today) |
| `/admin/students` | Students table (filters, bulk actions) |
| `/admin/students/[id]` | Student detail (timeline, enrollments, payments, workouts, assessments) |
| `/admin/finance` | Receivables, payments, invoices |
| `/admin/schedule` | Weekly calendar grid + class CRUD |
| `/admin/plans` | Membership plans CRUD |
| `/admin/settings` | Identity (logo, colors), academy profile, integrations |

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

## White-label theming

The website itself uses the default Gym branding (indigo / violet). Per-academy
white-labeling is a concern of the **app/** project — see
[`app/CLAUDE.md`](../app/CLAUDE.md).

## Implementation Order

1. Project scaffold + Apollo Client + shadcn primitives
2. `src/lib/seo.ts` (metadata + JSON-LD helpers)
3. Landing page (`/`) — adapt the existing `mockups/landing.html`
4. Other marketing pages (`/pricing`, `/features`, `/about`, `/contact`)
5. `app/sitemap.ts`, `app/robots.ts`, OG images
6. Admin login + auth flow
7. Admin dashboard, students list/detail, finance, schedule, plans, settings
8. Connect every page to the Strapi GraphQL API (codegen the types)

## UI/UX Notes

- Language: **PT-BR** throughout
- Date format: `DD/MM/YYYY` (`date-fns/locale/pt-BR`)
- Currency: `R$ 1.234,56` (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`)
- Mobile-first marketing, desktop-first admin
- Loading: shadcn `Skeleton`
- Errors: shadcn `Sonner`
- Modals: shadcn `Dialog` (never `window.alert/confirm/prompt`)
