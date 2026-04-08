# Gym — Website (Marketing + Admin)

The public-facing landing site and the academy admin panel. Both live in the
same Next.js project because they share branding, components, and the
authenticated session for admins coming straight from `/login`.

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS** + CSS variables
- **Apollo Client 4** — every data call goes through GraphQL
- **shadcn/ui** (Radix-based components)
- **React Hook Form + Zod**
- **date-fns** (PT-BR locale)

> Why Apollo (not TanStack Query)? The backend exposes GraphQL only — see
> [`backend/CLAUDE.md → GraphQL Schema`](../backend/CLAUDE.md#graphql-schema).
> Apollo's normalized cache + subscriptions are a better fit than building
> the same machinery on top of plain `fetch`.

## Setup

```bash
cd website
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install @apollo/client@4 graphql zod react-hook-form @hookform/resolvers date-fns
npx shadcn@latest init
```

Then add the recommended shadcn primitives (`button`, `card`, `dialog`,
`form`, `input`, `select`, `table`, `tabs`, `dropdown-menu`, `sheet`,
`skeleton`, `sonner`).

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

## Apollo Client setup

```ts
// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Academy: { keyFields: ['documentId'] },
      Student: { keyFields: ['documentId'] },
      // …one per content type
    },
  }),
});
```

The cache is keyed on `documentId` so Strapi v5's stable IDs round-trip
correctly through Apollo's normalized store.

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
