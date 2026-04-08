# Gym 🏋️

White-label gym management SaaS — complete platform for academies to manage
students, schedules, payments, and workouts. Multi-tenant: every academy
gets their own subdomain, logo, colors, and data isolation.

## Stack

- **Backend:** Strapi v5 + PostgreSQL + GraphQL (explicit schema, `shadowCRUD` off)
- **Website:** Next.js 14 (marketing landing + admin panel) + Apollo Client 4
- **App:** Next.js 14 (student-facing white-label) + Apollo Client 4
- **Styling:** Tailwind CSS + CSS variables (per-academy theming)
- **Payments:** Asaas (PIX, boleto, credit card)
- **Storage:** S3-compatible upload provider
- **Language:** PT-BR throughout

## Structure

```
gym/
├── backend/          # Strapi v5 API + GraphQL schema  → backend/CLAUDE.md
├── website/          # Marketing + admin (Next.js)     → website/CLAUDE.md
├── app/              # Student-facing white-label app  → app/CLAUDE.md
├── mockups/          # Static HTML prototypes
├── dev.sh            # tmux launcher for every scaffolded service
├── CLAUDE.md         # Root architecture overview
└── README.md
```

> Status: `backend/` is live. `website/` and `app/` are scaffolded as
> documentation only — `dev.sh` skips them until they have a `package.json`.

## Quick Start

```bash
# 1. Make sure PostgreSQL is running with the credentials in backend/.env
# 2. Install backend dependencies once
cd backend && npm install && cd ..

# 3. Launch every scaffolded service in a single tmux session
./dev.sh
```

`dev.sh` detects which of `backend/`, `website/`, and `app/` are scaffolded
(checks for `package.json`) and creates one pane per service. Missing
directories are skipped, so the script works today and keeps working as
new services come online.

```bash
./dev.sh             # start and attach
./dev.sh --detach    # start in the background
./dev.sh --kill      # stop the running session
./dev.sh --help
```

After boot:

- Strapi admin: http://localhost:1337/admin
- GraphQL playground (dev only): http://localhost:1337/graphql
- Asaas webhook: `POST http://localhost:1337/api/payments/webhook`

On the first backend boot, `SEED_DEMO=true` will create the **Gym Demo**
academy along with two plans, three students, two class schedules and a
sample workout plan — set `SEED_DEMO=false` afterwards.

## API

Every data call from the website + app goes through GraphQL at
`POST /graphql`. The schema is defined explicitly under
`backend/src/extensions/graphql/`, exposes `documentId` (never the
numeric primary key), and defaults every resolver to `auth: true` —
the only public surface is `Query.academyBySlug`, used by the
white-label theming.

REST is reserved for users-permissions auth (`/api/auth/local`, etc.)
and the Asaas webhook.

## Mockups

Static HTML prototypes live under `mockups/` and are linked to from
`mockups/README.md`. Use them as the visual reference when scaffolding
the website / app pages.

## Links

- GitHub: https://github.com/quick-filler/gym
- Production: TBD
