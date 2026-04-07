# Gym — Architecture Overview

White-label gym management SaaS. Multi-tenant: each academy has its own subdomain, logo, colors, and data isolation.

## Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Strapi v5 (Node.js, PostgreSQL)   |
| Frontend  | Next.js 14 (App Router, TS)       |
| Styling   | Tailwind CSS + CSS variables      |
| State     | TanStack Query + Zustand          |
| Payments  | Asaas (Brazilian gateway)         |
| Storage   | Strapi Upload (S3-compatible)     |

## Repository Structure

```
gym/
├── backend/          # Strapi v5 — see backend/CLAUDE.md
├── frontend/         # Next.js 14 — see frontend/CLAUDE.md
├── .gitignore
├── README.md
└── CLAUDE.md         ← you are here
```

## Multi-tenancy Model

Each **Academy** has:
- A unique `subdomain` (e.g., `crossfit-sp.gym.app`)
- Their own `logo`, `primaryColor`, `secondaryColor`
- A `plan` (starter / business / pro)
- Full data isolation via Strapi relations (all content types belong to an Academy)

The frontend reads the subdomain from the URL and fetches the academy's branding config from the API on every page load, applying it via CSS variables.

## Sub-module Details

- **[Backend Architecture →](./backend/CLAUDE.md)**
- **[Frontend Architecture →](./frontend/CLAUDE.md)**

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gym
DATABASE_USERNAME=gym
DATABASE_PASSWORD=secret
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
JWT_SECRET=...
ASAAS_API_KEY=...
ASAAS_WEBHOOK_TOKEN=...
S3_BUCKET=...
S3_ENDPOINT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_APP_DOMAIN=gym.app
```

## Development Flow

1. Run Postgres locally (or Docker)
2. `cd backend && npm run develop` → Strapi admin at http://localhost:1337/admin
3. `cd frontend && npm run dev` → Next.js at http://localhost:3000
4. Add `test.localhost` to `/etc/hosts` to test white-label routing locally

## Deployment

- Backend: Hetzner VPS or Railway (Docker)
- Frontend: Vercel (recommended) or same VPS
- DB: Managed Postgres (Hetzner, Supabase, Neon)
