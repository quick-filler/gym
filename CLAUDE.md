# Gym — Architecture Overview

White-label gym management SaaS. Multi-tenant: each academy has its own
subdomain, logo, colors, and data isolation.

## Stack

| Layer     | Technology                                                         |
|-----------|--------------------------------------------------------------------|
| Backend   | Strapi v5 + PostgreSQL + TypeScript                                |
| API       | GraphQL (explicit schema, `shadowCRUD` disabled)                   |
| Website   | Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4        |
| Student app | Expo SDK 54 + React Native 0.81 + TypeScript                     |
| Data layer | Apollo Client 4 + `@graphql-codegen/cli` (client preset)          |
| Styling   | Tailwind CSS v4 (website) / NativeWind (app) + per-academy CSS vars |
| Payments  | Asaas (Brazilian gateway — PIX, boleto, credit card)               |
| Storage   | @strapi/provider-upload-aws-s3 (S3-compatible)                     |
| i18n      | pt-BR throughout                                                   |

### Strapi plugins enabled

- `@strapi/plugin-users-permissions` — auth (JWT in localStorage)
- `@strapi/plugin-graphql` — single data API for the website + app
- `strapi-plugin-config-sync` — exports core-store & permissions to
  `backend/config/sync/` so role config travels with the repo
- `@strapi/provider-upload-aws-s3` — default upload provider; falls back
  to local storage when `UPLOAD_PROVIDER=local`
- `@strapi/plugin-cloud` — Strapi Cloud integration (default)

## Repository Structure

```
gym/
├── backend/          # Strapi v5 API — see backend/CLAUDE.md
├── website/          # Marketing landing + academy admin panel — see website/CLAUDE.md
├── app/              # Student-facing white-label app — see app/CLAUDE.md
├── mockups/          # Static HTML prototypes (landing, admin, student)
├── docs/             # Long-form docs — design decisions, ADRs
├── dev.sh            # tmux launcher for every scaffolded service
├── README.md
└── CLAUDE.md         ← you are here
```

All three sub-projects compile cleanly and ship running UI:

- `backend/` — Strapi v5 running against a local Postgres (`gym`/`secret`)
- `website/` — Next.js 16 with Apollo Client 4 + codegen. Every
  mockup page is live (`/`, `/pricing`, `/features`, `/about`,
  `/contact`, `/login`, plus `/admin/dashboard`, `/admin/students`,
  `/admin/finance`, `/admin/schedule`, `/admin/settings`). Ships with
  demo-mode fixtures so a fresh clone renders without the backend —
  see [`website/CLAUDE.md#demo-mode`](./website/CLAUDE.md#demo-mode).
  `npm run build` passes with 13 static routes.
- `app/` — Expo + React Native with Apollo Client 4 + codegen. Same
  mock-vs-API toggle pattern (`EXPO_PUBLIC_USE_MOCKS`), the website
  toggle is deliberately a port of this.
- `dev.sh` detects each project and spawns its own tmux pane

**[`docs/design-decisions.md`](./docs/design-decisions.md)** is the
single source of truth for *why* things are the way they are (stack
choices, GraphQL conventions, palette, typography, anti-slop rules,
SEO strategy, rejected options). Always check there before reopening
a settled question — and keep it updated as new decisions ship (see
[Working conventions](#working-conventions) below).

## Working conventions

These are hard rules for any agent or human touching the repo. They
exist to keep the project self-explanatory as it grows, so a fresh
clone (or a Claude session with no prior context) can reconstruct
*why* every choice was made without re-interviewing anyone.

### 1. Design decisions are always documented

**Any non-obvious technical decision goes into
[`docs/design-decisions.md`](./docs/design-decisions.md).**

A "non-obvious" decision is anything where:
- You chose one option over a defensible alternative.
- You rejected something the reader might reasonably expect you to use.
- You accepted a tradeoff that will matter in the next 6 months.
- A future session would otherwise have to rediscover the reasoning.

Decisions are logged in the mini-ADR format already established there:
**Decision / Context / Rationale / Consequences / Revisit when**.
Rejected options go in `§10` so they are not re-argued. Do not delete
old entries when revisiting — mark them `[SUPERSEDED]` and add the
replacement inline.

If you are making the decision during an implementation commit, add
the `docs/design-decisions.md` update **to the same commit**. Never
leave documentation for "later" — "later" is how drift happens.

### 2. README, root CLAUDE.md, sub-project CLAUDE.md stay in sync

When any of the following change, every affected doc updates in the
same commit:

- Repo structure (new top-level folder)
- Stack choice (framework, database, key plugin)
- Setup commands (install order, env vars, required local services)
- The GraphQL schema (regenerate `backend/schema.graphql` and commit)

Sub-project docs (`backend/CLAUDE.md`, `website/CLAUDE.md`,
`app/CLAUDE.md`) hold the detail. The root `CLAUDE.md` and `README.md`
hold the summary + links. None of them should lie about the others.

### 3. Every commit that changes the GraphQL schema also regenerates it

The file `backend/schema.graphql` is the source of truth that the
frontend codegen reads. When you add or modify a backend GraphQL type:

```bash
cd backend && npm run develop        # let it boot once, then Ctrl-C
# (or `npx strapi ts:generate-types` if Postgres is available)
git add schema.graphql
```

Commit the schema diff alongside the code diff in the same commit.
A PR that touches the backend schema but not `schema.graphql` is
incomplete.

### 4. Frontend data calls go through GraphQL + Apollo, period

The only REST exceptions are users-permissions auth endpoints and the
Asaas webhook. Every data query/mutation from `website/` and `app/`
goes through a `.graphql` document → `graphql()` from the generated
`gql/` → `useQuery` / `useMutation`. If you find yourself reaching
for `fetch()` against `/api/…` for something that isn't auth,
stop — it belongs in the GraphQL schema.

### 5. `npm run codegen` is idempotent and committed

Running `npm run codegen` in `website/` or `app/` produces no git diff
when the schema and queries are unchanged. The generated `gql/` folder
is committed so fresh clones and CI can type-check without running
codegen first.

### 6. Structural changes export `config-sync` in the same commit

Content types, roles, and permissions live both in code *and* in
Strapi's database (core-store). The `strapi-plugin-config-sync` plugin
exports the DB-side state to `backend/config/sync/` so environments
stay in lockstep.

**Run `npm run config:export` any time a commit:**

- adds, renames, or removes a content type (including new API UIDs)
- changes the permissions matrix in `src/bootstrap/permissions.ts`
- adds/removes a custom role (`academy_admin`, `instructor`, `student`)
- changes content-manager configuration (column order, list view
  settings) through the admin UI
- flips a core-store setting (i18n default locale, upload settings,
  users-permissions advanced config)

```bash
cd backend
npm run develop              # boot once so the plugin can read state
npm run config:export        # writes backend/config/sync/*.json
git add config/sync
git commit -m "…"
```

`importOnBootstrap` is intentionally **off** — another env picks up
the changes by running `npm run config:import` after pulling, so every
apply is reviewed by hand. A commit that touches a content type's
schema.json or `permissions.ts` but not `config/sync/` is incomplete.

## Multi-tenancy Model

Each **Academy** has:
- A unique `slug` (UID field, e.g. `crossfit-sp`) — used as subdomain
- Their own `logo`, `primaryColor`, `secondaryColor`
- A `plan` (starter / business / pro)
- Full data isolation via Strapi relations (all content types belong to
  an Academy, and list resolvers filter by the caller's academy)

The frontends read the subdomain, call the public `academyBySlug` GraphQL
query to fetch the branding config, and apply it via CSS variables at runtime.

## API Conventions

- **GraphQL is the only data surface for the apps.** Every type, query, and
  mutation is defined explicitly in `backend/src/extensions/graphql/`
  (`shadowCRUD` is disabled) so we never leak private fields or incremental DB IDs.
- **Strapi's `documentId` is the canonical GraphQL ID.** The numeric primary
  key is never exposed.
- **REST is reserved for auth** (`/api/auth/local`, `/api/auth/local/register`,
  etc. — provided by users-permissions) and the Asaas webhook
  (`POST /api/payments/webhook`, public but signature-verified).
- **Auth defaults to required.** Only `Query.academyBySlug` is `auth: false`;
  every other resolver requires a valid JWT.
- **JWT lives in localStorage** on the frontend, attached to Apollo's
  `Authorization: Bearer <token>` header.

See [backend/CLAUDE.md](./backend/CLAUDE.md#graphql-schema) for the full
schema layout.

## Sub-module Details

- **[Backend Architecture →](./backend/CLAUDE.md)**
- **[Website Architecture →](./website/CLAUDE.md)** (planned)
- **[Student App Architecture →](./app/CLAUDE.md)** (planned)

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
HOST=0.0.0.0
PORT=7777

# Secrets — generate with: openssl rand -base64 32
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
ENCRYPTION_KEY=...
JWT_SECRET=...

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gym
DATABASE_USERNAME=gym
DATABASE_PASSWORD=secret
DATABASE_SSL=false

# Asaas Payment Gateway
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3   # or .../api/v3 in prod
ASAAS_API_KEY=...
ASAAS_WEBHOOK_TOKEN=...                           # shared secret in the header

# File Upload — S3 is the default; set to "local" for offline dev
UPLOAD_PROVIDER=s3
S3_BUCKET=...
S3_REGION=us-east-1
S3_ENDPOINT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_FORCE_PATH_STYLE=true

# Demo seed (set to true on first boot to populate Gym Demo academy)
SEED_DEMO=true

# GraphQL playground (defaults to off in production)
GRAPHQL_PLAYGROUND=true
```

### Frontend (`website/.env.local` and `app/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:7777
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:7777/graphql
NEXT_PUBLIC_APP_DOMAIN=gym.app
```

## Development Flow

1. Start PostgreSQL locally (native or via Docker) with the credentials
   from `backend/.env`.
2. `./dev.sh` — launches every scaffolded service in a single tmux
   session with split panes (backend, website, app). Services with no
   `package.json` are skipped with a warning.
3. Add `test.localhost` (or similar) to `/etc/hosts` to test white-label
   subdomain routing locally.
4. On first backend boot: `SEED_DEMO=true` seeds the "Gym Demo" academy,
   two plans, three students, two schedules and a sample workout.

Admin: http://localhost:7777/admin
GraphQL playground: http://localhost:7777/graphql (dev only)

See `./dev.sh --help` for session commands (`--detach`, `--kill`).

## Deployment

- **Backend:** Hetzner VPS or Railway (Docker)
- **Website + App:** Vercel (recommended) or the same VPS
- **Database:** Managed Postgres (Hetzner, Supabase, Neon)
- **Uploads:** Any S3-compatible bucket (configured via the env vars above)
- **Config transfer between envs:** use `strapi config-sync export` /
  `config-sync import` via the Strapi admin — `importOnBootstrap` is
  intentionally off so changes always go through review.
