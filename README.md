# Gym 🏋️

White-label gym management SaaS — complete platform for academies to manage
students, schedules, payments, and workouts. Multi-tenant: every academy
gets their own subdomain, logo, colors, and data isolation.

## Stack

- **Backend:** Strapi v5 + PostgreSQL + GraphQL (explicit schema, `shadowCRUD` off)
- **Website:** Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4
- **Student app:** Expo SDK 54 + React Native 0.81 + TypeScript
- **Data layer:** Apollo Client 4 + `@graphql-codegen/cli` (client preset)
- **Payments:** Asaas (PIX, boleto, credit card)
- **Storage:** S3-compatible upload provider
- **Language:** PT-BR throughout

## Structure

```
gym/
├── backend/          # Strapi v5 API + GraphQL schema     → backend/CLAUDE.md
├── website/          # Next.js — marketing + admin        → website/CLAUDE.md
├── app/              # Expo — student white-label app     → app/CLAUDE.md
├── mockups/          # Static HTML prototypes
├── docs/             # Long-form docs (design decisions)
├── dev.sh            # tmux launcher for every scaffolded service
├── CLAUDE.md         # Root architecture + working conventions
└── README.md
```

All three sub-projects are scaffolded and compile cleanly as of the
latest commit (`backend` boots against local Postgres, `website` builds
on Next.js 16, `app` type-checks via Expo + TS).

## Quick Start

```bash
# 1. Create the local Postgres user + database (one-time)
#    — adjust if you already have a gym role locally
PGPASSWORD=foobar psql -h localhost -U root -d postgres \
  -c "CREATE USER gym WITH PASSWORD 'secret' CREATEDB;" \
  -c "CREATE DATABASE gym OWNER gym;"

# 2. Install dependencies in each project (one-time)
cd backend && cp .env.example .env   && npm install && cd ..
cd website && cp .env.local.example .env.local && npm install && cd ..
cd app     && cp .env.example .env              && npm install && cd ..

# 3. Regenerate the GraphQL types the frontends use
cd website && npm run codegen && cd ..
cd app     && npm run codegen && cd ..

# 4. Launch everything
./dev.sh
```

`dev.sh` detects which of `backend/`, `website/`, and `app/` are
scaffolded (checks for `package.json`) and creates one pane per service.
Missing directories are skipped.

```bash
./dev.sh             # start and attach
./dev.sh --detach    # start in the background
./dev.sh --kill      # stop the running session
./dev.sh --help
```

After boot:

- **Strapi admin**: http://localhost:7777/admin
- **GraphQL playground** (dev only): http://localhost:7777/graphql
- **Asaas webhook**: `POST http://localhost:7777/api/payments/webhook`
- **Website**: http://localhost:9999 — landing, pricing, features,
  about, contact, login, and the admin panel (dashboard, students,
  finance, schedule, settings). All pages ship with demo-mode fixtures
  so a fresh clone works without a running backend.
- **Student app (Expo)**: press `w` in the `app` pane for the web
  preview, or scan the QR with Expo Go on a phone

### Demo mode

Both `website/` and `app/` default to **live mode** —
`NEXT_PUBLIC_USE_MOCKS=false` / `EXPO_PUBLIC_USE_MOCKS=false`. The
frontends expect a running Strapi backend at the endpoint in
`.env.local` / `.env` (defaults to `http://localhost:7777/graphql`).
Flip either flag to `true` to render the `src/lib/mock-data.ts`
fixtures instead — useful for UI work on a fresh clone or offline
demos. See [`website/CLAUDE.md#demo-mode`](./website/CLAUDE.md#demo-mode)
and [`docs/design-decisions.md §4.7`](./docs/design-decisions.md) for
the rationale.

On the first backend boot, `SEED_DEMO=true` creates the **Gym Demo**
academy with 2 plans, 3 students, 2 class schedules and a sample workout
plan — set `SEED_DEMO=false` in `backend/.env` afterwards.

## API

Every data call from the website + app goes through GraphQL at
`POST /graphql`. The schema is defined explicitly under
`backend/src/extensions/graphql/`, exposes `documentId` (never the
numeric primary key), and defaults every resolver to `auth: true` —
the only public surface is `Query.academyBySlug`, used by the
white-label theming.

REST is reserved for users-permissions auth (`/api/auth/local`, etc.)
and the Asaas webhook. **No app data calls use REST.**

### Adding a GraphQL operation

```tsx
// 1. Add the query to src/graphql/<domain>.graphql (website)
//    or graphql/<domain>.graphql (app)
query AcademyBranding($slug: String!) {
  academyBySlug(slug: $slug) { documentId name primaryColor }
}

// 2. Regenerate types
// $ npm run codegen

// 3. Use it in a component
import { useQuery } from '@apollo/client/react';
import { graphql } from '@/gql'; // or '../gql' in app/
const ACADEMY = graphql(`query AcademyBranding(...) { ... }`);
const { data, loading } = useQuery(ACADEMY, { variables: { slug } });
```

Data is fully typed — no annotations, no casts.

## Documentation layout

- **[Root CLAUDE.md](./CLAUDE.md)** — architecture overview + working
  conventions (including the rule that every design decision must be
  documented).
- **[docs/design-decisions.md](./docs/design-decisions.md)** — every
  non-obvious technical choice in mini-ADR format
  (Decision / Context / Rationale / Consequences). The first place to
  check before reopening a settled question.
- **[backend/CLAUDE.md](./backend/CLAUDE.md)** — content types,
  GraphQL schema layout, Asaas integration, bootstrap/seed, plugins.
- **[website/CLAUDE.md](./website/CLAUDE.md)** — Next.js project
  layout, Apollo + codegen wiring, page map, SEO strategy.
- **[app/CLAUDE.md](./app/CLAUDE.md)** — Expo project layout, Apollo
  + codegen wiring, white-label theming, EAS Update channels.
- **[mockups/README.md](./mockups/README.md)** — static HTML
  prototypes and the shared design system file.

## Mockups

Static HTML prototypes live under `mockups/` and are linked from
`mockups/README.md`. Use them as the visual reference when building the
real website / app pages.

## Links

- GitHub: https://github.com/quick-filler/gym
- Production: TBD
