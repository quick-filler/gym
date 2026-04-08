# Gym 🏋️

White-label gym management SaaS — complete platform for academies to manage students, schedules, payments, and workouts.

## Overview

**Gym** is a multi-tenant SaaS where each academy gets their own branded experience (logo, colors, subdomain). Built with:

- **Backend:** Strapi v5 (REST API + PostgreSQL)
- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS)

## Structure

```
gym/
├── backend/          # Strapi v5 API
│   └── CLAUDE.md     # Backend architecture & implementation guide
├── frontend/         # Next.js 14 app
│   └── CLAUDE.md     # Frontend architecture & implementation guide
├── CLAUDE.md         # Root architecture overview
└── README.md
```

## Quick Start

Install dependencies once, then launch everything in a single tmux session:

```bash
cd backend && npm install && cd ..   # website/ and app/ will be added later
./dev.sh                               # splits every scaffolded service into its own tmux pane
```

`dev.sh` detects which of `backend/`, `website/`, and `app/` are scaffolded
(checks for `package.json`) and creates one pane per service. Missing
directories are skipped, so the script works today and keeps working as new
services come online.

```bash
./dev.sh             # start and attach
./dev.sh --detach    # start in the background
./dev.sh --kill      # stop the running session
```

Prerequisites: `tmux`, Node.js 20+, and a running PostgreSQL with the
credentials from `backend/.env`.

## Links

- GitHub: https://github.com/quick-filler/gym
- Production: TBD
