# Architecture

A single source of truth for the data model, the service graph, and how
frontend surfaces talk to the backend. Keep this in sync with
`backend/schema.graphql`, `website/src/lib/hooks.ts`, and
`docs/design-decisions.md`.

> Diagrams are Mermaid so they render on GitHub / most Markdown viewers.
> If you add a new content type or an aggregate resolver, update this
> file **in the same commit** (see `docs/design-decisions.md §9.6`).

## Database ERD

```mermaid
erDiagram
    Academy ||--o{ Student : "has many"
    Academy ||--o{ Plan : "offers"
    Academy ||--o{ ClassSchedule : "runs"
    Academy ||--o{ Expense : "tracks"
    Academy ||--o{ Dependent : "indirect via Student"

    Student }o--|| UsersPermissionsUser : "1:1 auth"
    Student ||--o{ Enrollment : "enrolls in"
    Student ||--o{ ClassBooking : "books"
    Student ||--o{ WorkoutPlan : "receives"
    Student ||--o{ BodyAssessment : "has"
    Student ||--o{ Dependent : "guardian_of"

    Dependent ||--o{ Enrollment : "child_enrolls"
    Dependent ||--o{ ClassBooking : "child_books"
    Dependent ||--o{ WorkoutPlan : "child_receives"
    Dependent ||--o{ BodyAssessment : "child_has"

    Plan ||--o{ Enrollment : "contract"
    Enrollment ||--o{ Payment : "generates"
    ClassSchedule ||--o{ ClassBooking : "occurrences"

    Academy {
        string name
        uid slug
        media logo
        string primaryColor
        string secondaryColor
        enum plan
        enum businessType
        json enabledModules
        enum billingMode
        boolean isActive
        string email
        string phone
        text address
    }

    Student {
        string name
        email email
        string phone
        date birthdate
        enum status
        boolean isGuardian
        text notes
    }

    Dependent {
        string name
        date birthdate
        enum gender
        enum relationship
        enum status
        string bloodType
        text allergies
        text medicalNotes
        string medicalAlert
        string emergencyContactName
        string emergencyContactPhone
    }

    Plan {
        string name
        text description
        decimal price
        enum billingCycle
        integer maxStudents
        json features
        boolean isActive
    }

    Enrollment {
        date startDate
        date endDate
        enum status
        enum paymentMethod
        string asaasCustomerId
        string asaasSubId
    }

    Payment {
        decimal amount
        date dueDate
        datetime paidAt
        enum status
        enum method
        string externalId
        string receiptUrl
    }

    Expense {
        string description
        string subtitle
        decimal amount
        date date
        date dueDate
        datetime paidAt
        enum category
        enum type
        enum status
        boolean recurrent
        integer recurrenceDay
        text notes
        media receipt
    }

    ClassSchedule {
        string name
        string instructor
        enum modality
        json weekdays
        string startTime
        string endTime
        integer maxCapacity
        string room
        boolean isActive
    }

    ClassBooking {
        date date
        enum status
        datetime checkedInAt
    }

    WorkoutPlan {
        string name
        string instructor
        json exercises
        date validFrom
        date validTo
        boolean isActive
    }

    BodyAssessment {
        date date
        decimal weight
        decimal height
        decimal bodyFat
        json measurements
        text notes
    }
```

## System architecture

```mermaid
graph TB
    subgraph "Clients"
        WebAdmin["Website /admin/*<br/>Next.js 16 client pages"]
        WebMarket["Website / (marketing)<br/>Next.js SSG"]
        App["Student App<br/>Expo / React Native"]
    end

    subgraph "Data Layer (client)"
        Apollo["Apollo Client 4<br/>InMemoryCache · documentId-keyed"]
        Codegen["@graphql-codegen<br/>client preset → src/gql/"]
    end

    subgraph "Strapi v5 Backend :7777"
        GQL["/graphql · explicit schema<br/>shadowCRUD OFF"]
        Auth["/api/auth/* REST<br/>users-permissions JWT"]
        Webhook["/api/payments/webhook<br/>Asaas signed"]
    end

    subgraph "External"
        Asaas["Asaas<br/>PIX · boleto · card"]
        S3["S3-compatible<br/>uploads"]
    end

    subgraph "Persistence"
        PG[("PostgreSQL :5432<br/>gym / secret")]
    end

    WebAdmin -->|useXxx hooks| Apollo
    WebMarket -.->|fetch at build| GQL
    App -->|useXxx hooks| Apollo
    Apollo -->|queries · JWT Bearer| GQL
    WebAdmin -->|login| Auth
    App -->|login| Auth
    GQL --> PG
    Auth --> PG
    Webhook --> PG
    GQL -->|customer / subscription| Asaas
    Asaas -->|events| Webhook
    GQL -->|uploads| S3
    Codegen -.->|reads committed SDL| GQL
```

## Content-type registry

| UID | Purpose | Academy-scoped | New |
|---|---|---|---|
| `api::academy.academy` | Tenant root, branding, business type | — | no |
| `api::student.student` | Academy member / practitioner | yes | no |
| `api::plan.plan` | Membership plan | yes | no |
| `api::enrollment.enrollment` | Student↔Plan contract | via student | no |
| `api::class-schedule.class-schedule` | Recurring class | yes | no |
| `api::class-booking.class-booking` | Specific occurrence booking | via student | no |
| `api::payment.payment` | Payment instalment | via enrollment | no |
| `api::workout-plan.workout-plan` | Personalised training plan | via student | no |
| `api::body-assessment.body-assessment` | Physical evaluation | via student | no |
| `api::expense.expense` | Operational expense | yes | **yes** |
| `api::dependent.dependent` | Minor enrolled by a guardian Student | yes | **yes** |

## GraphQL surface

Custom queries (beyond standard CRUD):

| Query | Auth | Returns | Page |
|---|---|---|---|
| `academyBySlug(slug)` | public | Academy branding | white-label theming |
| `me` | required | Student w/ academy, enrollments, workouts | app dashboard |
| `myDependents` | required | Guardian's children | app `/dependents` |
| `scheduleBookings(documentId, date)` | required | Bookings for a class on a date | admin schedule |
| `adminDashboard` | required | Metrics + recent students + today + upcoming | `/admin/dashboard` |
| `financeOverview(month, year)` | required | KPIs + charges + method split | `/admin/finance` |
| `dreOverview(month, year)` | required | Revenue/expenses/profit + 6mo cashflow + categories | `/admin/dre` |
| `scheduleWeek(weekStart)` | required | Weekly grid + stats + upcoming | `/admin/schedule` |
| `guardians` | required | Families (guardian + dependents list) | `/admin/dependents` |
| `workoutPlans` | required | All workout plans for the academy | `/admin/workouts` |

Mutations of note:

| Mutation | Side effects |
|---|---|
| `createStudent` | none (enrollment follows) |
| `createEnrollment` | `afterCreate` lifecycle → Asaas customer + subscription |
| `updateEnrollment{status:cancelled}` | `afterUpdate` lifecycle → Asaas subscription cancel |
| `checkInBooking` | stamps `checkedInAt` |
| `createExpense` | auto-scopes to caller's academy |
| `createDependent` | auto-flips guardian's `Student.isGuardian = true` |

## Frontend hook ↔ query map

### Website (`website/src/lib/hooks.ts`)

| Hook | Domain type | Query | Status |
|---|---|---|---|
| `usePricingPlans` | `PricingPlan[]` | `plans` | ✅ wired |
| `useDashboard` | `DashboardData` | `adminDashboard` | ✅ wired |
| `useStudents` | `StudentRow[]` | `students` | ✅ wired |
| `useFinance` | `FinanceData` | `financeOverview` | ✅ wired |
| `useSchedule` | `ScheduleData` | `scheduleWeek` | ✅ wired |
| `useAcademy` | `AcademySettings` | `me.academy` | ✅ wired |
| `useDRE` | `DREData` | `dreOverview` | ✅ wired |
| `useDependents` | `GuardianFamily[]` | `guardians` | ✅ wired |
| `useWorkouts` | `WorkoutsData` | `workoutPlans` | ✅ wired |

Each hook respects `NEXT_PUBLIC_USE_MOCKS`:
- `true` → synchronous `MOCK_*` fixture
- `false` → `useQuery` against the endpoint in `NEXT_PUBLIC_GRAPHQL_ENDPOINT`

### Student app (`app/hooks/`)

| Hook | Query | Status |
|---|---|---|
| `useDashboard` | `MyDashboard` (inline) | ✅ wired |
| `useDependents` | `AppMyDependents` (me + myDependents) | ✅ wired |
| `useSchedule` | — | ⏳ mock only (fixture imported directly) |
| `useWorkouts` | — | ⏳ mock only |
| `usePayments` | — | ⏳ mock only |
| `useProfile` | — | ⏳ mock only |

The pending ones are simple wrappers around `me.{bookings|workoutPlans|payments}` subfield queries — same shape, same mapping pattern as `useDependents`.

## Permissions

Two decoupled layers:

**users-permissions (Strapi plugin)** — default roles only. Every API
caller is either `Public` (only the Asaas webhook is enabled) or
`Authenticated` (anything else requires a JWT). `src/bootstrap/permissions.ts`
also removes any legacy `academy_admin`/`instructor`/`student` rows
that older boots created.

**Gym role on `Student.role`** — the academy-facing role lives on the
Student content type:

| `Student.role` | Access |
|---|---|
| `academy_admin` | Full CRUD on their academy's data — finance, students, expenses, dependents |
| `instructor` | Read students, manage schedules, write assessments + workouts |
| `member` (default) | Read own data, book classes, view own workouts |

GraphQL resolvers look up the caller's `Student` via the
`resolveUserAcademyId` helper (in `src/extensions/graphql/helpers.ts`)
and branch on `Student.role` as needed. `resolversConfig.auth` stays
`true` for everything except `Query.academyBySlug`.

### Dev login (SEED_DEMO=true)

`bootstrap/seed.ts → ensureDemoDevUser` runs on every
`SEED_DEMO=true` boot and idempotently provisions:

- a users-permissions user `admin@gym-demo.com` / `gym-demo-admin`
  (overridable via `DEV_USER_EMAIL` / `DEV_USER_PASSWORD`), assigned
  the default `Authenticated` role
- Ana Costa's Student record linked to that user, `role = academy_admin`

Credentials are printed prominently in the boot log so the operator
doesn't have to grep source.

## Authentication flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Website (Apollo)
    participant S as Strapi
    U->>W: POST /api/auth/local { email, password }
    W->>S: forward login
    S->>S: users-permissions verifies credential
    S-->>W: { jwt, user }
    W->>W: localStorage["gym_jwt"] = jwt
    U->>W: navigate to /admin/dre
    W->>S: POST /graphql { query dreOverview }<br/>Authorization: Bearer jwt
    S->>S: resolveUserAcademyId(ctx.state.user)
    S->>S: aggregate payments + expenses
    S-->>W: DREOverview payload
    W-->>U: rendered page
```

## Switching a frontend to live data

```bash
# 1. Start backend
cd backend && npm run develop      # :7777

# 2. Flip the website toggle + point at the backend
cd website
cat > .env.local <<'EOF'
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:7777/graphql
NEXT_PUBLIC_SITE_ORIGIN=http://localhost:9999
EOF
npm run dev                        # :9999

# 3. Log in at http://localhost:9999/login with a seeded academy_admin
# 4. Every /admin/* page now runs one round-trip against the aggregate
#    resolvers. Mock fixtures remain available by flipping the flag back.
```

## Pending work

- **App hooks for schedule/workouts/payments/profile** — trivial once
  the backend `me.*` subfield resolvers return the full shape (they
  partially do today). ~1h each.
- **N+1 on aggregate resolvers** — `dreOverview` and `financeOverview`
  eager-load every payment/expense and aggregate in memory. Fine at
  Gym Demo volumes; move to SQL aggregates (`strapi.db.connection.raw`)
  once a real academy crosses a few thousand rows.
- **Dependent billing mode** — `Academy.billingMode` exists but
  `createEnrollment` doesn't yet route a family's payments onto the
  guardian's Asaas customer when `billingMode === 'per_family'`. Spec
  lives in `backend/CLAUDE.md §Módulo de Dependentes`.
- **Pool / Documents / Makeups / Progress / Terms / Resources modules**
  — content types not built (stubs in mockups); feature flags already
  exist on `Academy.enabledModules`.
