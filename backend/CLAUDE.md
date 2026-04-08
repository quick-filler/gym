# Gym — Backend Architecture (Strapi v5)

## Stack

- **Strapi v5** (`5.42.x`)
- **PostgreSQL** (primary database)
- **Node.js 20+**
- **TypeScript** (enabled)

## Plugins

| Plugin | Purpose |
|---|---|
| `@strapi/plugin-users-permissions` | JWT auth, roles, registration |
| `@strapi/plugin-graphql` | The data API for the website + app (`shadowCRUD: false`) |
| `strapi-plugin-config-sync` | Exports core-store + permissions to `config/sync/` for env-to-env transfer |
| `@strapi/provider-upload-aws-s3` | Default upload provider — set `UPLOAD_PROVIDER=local` to opt out |
| `@strapi/plugin-cloud` | Strapi Cloud integration (default) |

Plugin config lives in `config/plugins.ts`. Notable settings:
- `graphql.shadowCRUD = false` — every type is defined explicitly in
  `src/extensions/graphql/`.
- `graphql.playgroundAlways` — bound to `GRAPHQL_PLAYGROUND` env (off in
  production by default).
- `config-sync.importOnBootstrap = false` — review-required pull workflow.
- `users-permissions.jwt.expiresIn = '30d'`.
- `upload` — switches between `aws-s3` and Strapi's local fallback based on
  `UPLOAD_PROVIDER` (defaults to `s3`).

## Setup

```bash
cd backend
npm install
cp .env.example .env       # then fill in secrets, DB creds, Asaas key
npm run develop
```

## Content Types

All content types belong to an **Academy** (multi-tenant isolation).

### Academy

Tenant root entity.

| Field | Type | Notes |
|---|---|---|
| name | String (req) | Academy display name |
| slug | UID | Auto-generated from name, used as subdomain |
| logo | Media | Academy logo image |
| primaryColor | String | Hex color, default `#6366f1` |
| secondaryColor | String | Hex color, default `#8b5cf6` |
| plan | Enum | `starter` / `business` / `pro` |
| isActive | Boolean | Default true |
| email | Email | Admin contact |
| phone | String | |
| address | Text | |
| students | Relation | hasMany Student |
| plans | Relation | hasMany Plan |
| schedules | Relation | hasMany ClassSchedule |

### Student

Academy member (aluno).

| Field | Type | Notes |
|---|---|---|
| name | String (req) | |
| email | Email (req) | Unique per academy |
| phone | String | |
| photo | Media | |
| birthdate | Date | |
| status | Enum | `active` / `inactive` / `suspended` |
| notes | Text | |
| academy | Relation | manyToOne Academy |
| user | Relation | oneToOne users-permissions.user (for student login) |
| enrollments | Relation | hasMany Enrollment |
| bookings | Relation | hasMany ClassBooking |
| workoutPlans | Relation | hasMany WorkoutPlan |
| assessments | Relation | hasMany BodyAssessment |

### Plan (Plano de Matrícula)

| Field | Type | Notes |
|---|---|---|
| name | String (req) | "Mensal", "Trimestral", "Anual" |
| description | Text | |
| price | Decimal (req) | |
| billingCycle | Enum | `monthly` / `quarterly` / `annual` |
| maxStudents | Integer | null = unlimited |
| features | JSON | Array of feature strings |
| isActive | Boolean | |
| academy | Relation | manyToOne Academy |
| enrollments | Relation | hasMany Enrollment |

### Enrollment (Matrícula)

| Field | Type | Notes |
|---|---|---|
| student | Relation | manyToOne Student |
| plan | Relation | manyToOne Plan |
| startDate | Date (req) | |
| endDate | Date | |
| status | Enum | `active` / `cancelled` / `expired` |
| paymentMethod | Enum | `pix` / `credit_card` / `boleto` |
| asaasCustomerId | String (private) | Asaas customer id |
| asaasSubId | String (private) | Asaas subscription id |
| payments | Relation | hasMany Payment |

`asaasCustomerId` / `asaasSubId` are marked `private: true` so they're
omitted from REST responses, and they're never exposed via GraphQL
(the schema in `src/extensions/graphql/types/enrollment.ts` doesn't
include them at all).

### ClassSchedule (Grade de Aulas)

| Field | Type | Notes |
|---|---|---|
| name | String (req) | "Musculação Turma A" |
| instructor | String | |
| modality | Enum | `presential` / `online` |
| weekdays | JSON | Array of ints: `[1,3,5]` = Mon/Wed/Fri |
| startTime | String | "06:00" |
| endTime | String | "07:00" |
| maxCapacity | Integer | Default 20 |
| room | String | |
| isActive | Boolean | |
| academy | Relation | manyToOne Academy |
| bookings | Relation | hasMany ClassBooking |

### ClassBooking (Agendamento)

| Field | Type | Notes |
|---|---|---|
| student | Relation | manyToOne Student |
| classSchedule | Relation | manyToOne ClassSchedule |
| date | Date (req) | Specific occurrence date |
| status | Enum | `confirmed` / `cancelled` / `attended` / `missed` |
| checkedInAt | DateTime | Timestamp of check-in |

### Payment (Pagamento)

| Field | Type | Notes |
|---|---|---|
| enrollment | Relation | manyToOne Enrollment |
| amount | Decimal (req) | |
| dueDate | Date (req) | |
| paidAt | DateTime | |
| status | Enum | `pending` / `paid` / `overdue` / `cancelled` |
| method | Enum | `pix` / `credit_card` / `boleto` |
| externalId | String | Asaas payment id (used for webhook idempotency) |
| receiptUrl | String | Link to receipt / boleto PDF |

### WorkoutPlan (Ficha de Treino)

| Field | Type | Notes |
|---|---|---|
| name | String (req) | "Treino A — Peito e Tríceps" |
| student | Relation | manyToOne Student |
| instructor | String | |
| exercises | JSON | `Array<{ name, sets, reps, load, notes }>` |
| validFrom | Date | |
| validTo | Date | |
| isActive | Boolean | |

### BodyAssessment (Avaliação Física)

| Field | Type | Notes |
|---|---|---|
| student | Relation | manyToOne Student |
| instructor | String | |
| date | Date (req) | |
| weight | Decimal | kg |
| height | Decimal | cm |
| bodyFat | Decimal | % |
| measurements | JSON | `{ chest, waist, hips, arms, thighs, ... }` |
| notes | Text | |

## GraphQL Schema

The website + app talk to the backend exclusively via GraphQL. `shadowCRUD`
is disabled, so the entire `/graphql` surface is defined explicitly under
`src/extensions/graphql/` (one module per content type), and registered via
`strapi.plugin('graphql').service('extension').use(...)` from the
`register()` hook in `src/index.ts`.

### Conventions

- **`documentId` is the canonical GraphQL ID.** The numeric primary key
  is never exposed.
- **One module per content type** under `src/extensions/graphql/types/`.
  Each module exports a `build<X>({ nexus, strapi })` function returning
  `{ types, resolversConfig }`.
- **Auth defaults to required.** Every resolver has a
  `resolversConfig['<Type>.<field>'] = { auth: true }` entry; the only
  `auth: false` resolver is `Query.academyBySlug`.
- **Relation fields are lazy.** Each relation field resolver re-fetches the
  parent document with `populate`. Wasteful but simple — add a dataloader
  layer when N+1 becomes a real cost.
- **List queries are academy-scoped** when the caller is linked to a
  Student record (see `helpers.ts → resolveUserAcademyId`). Super-admins
  bypass the scope.

### File layout

```
backend/src/extensions/graphql/
├── index.ts              # Registers every module via the extension service
├── helpers.ts            # resolveUserAcademyId, withAcademyScope
└── types/
    ├── common.ts         # Media, PaginationInput
    ├── academy.ts
    ├── student.ts
    ├── plan.ts
    ├── enrollment.ts
    ├── class-schedule.ts
    ├── class-booking.ts
    ├── payment.ts
    ├── workout-plan.ts
    └── body-assessment.ts
```

### Query / mutation surface

Standard CRUD per content type:

```graphql
# Reads
academies(pagination: PaginationInput): [Academy!]!
academy(documentId: ID!): Academy
students(pagination: PaginationInput): [Student!]!
student(documentId: ID!): Student
# … same shape for plans, enrollments, classSchedules, classBookings,
#   payments, workoutPlans, bodyAssessments

# Writes
createStudent(data: StudentInput!): Student
updateStudent(documentId: ID!, data: StudentUpdateInput!): Student
deleteStudent(documentId: ID!): Student
# … same shape for the others
```

Custom queries / mutations:

| Field | Auth | Purpose |
|---|---|---|
| `Query.academyBySlug(slug)` | **public** | Branding lookup for the white-label theming |
| `Query.me` | required | Authenticated student's full profile (deeply populated) |
| `Query.scheduleBookings(documentId, date?)` | required | Bookings for a schedule on a given date |
| `Mutation.checkInBooking(documentId)` | required | Mark attendance + stamp `checkedInAt` |

### Adding a new content type

1. Create the schema under `src/api/<name>/content-types/<name>/schema.json`.
2. Add a module under `src/extensions/graphql/types/<name>.ts` exporting
   `build<Name>({ nexus, strapi })` — copy `plan.ts` as a template.
3. Register the module in `src/extensions/graphql/index.ts` (single import +
   single line in the `modules` array).
4. Run `npx strapi ts:generate-types` to refresh the generated TS types.

## REST surface

Only one custom REST endpoint exists, and it's strictly for the external
payment gateway:

```
POST /api/payments/webhook   → Asaas webhook (signature-validated)
```

The standard users-permissions auth endpoints (`/api/auth/local`,
`/api/auth/local/register`, `/api/auth/forgot-password`, etc.) are also
available unchanged. Apart from that, no REST endpoints exist for app
data — everything goes through `/graphql`.

## Roles & Permissions

Defined in `src/bootstrap/permissions.ts` and applied at every boot
(idempotent — checks for existing roles before creating).

| Role | Access |
|---|---|
| `super_admin` | Full Strapi admin (platform owner) |
| `academy_admin` | Full CRUD on their own academy's data |
| `instructor` | Read students, manage schedules, write assessments + workouts |
| `student` | Read own data, book classes, view own workouts |
| `public` | Asaas webhook only |

GraphQL authorization is enforced separately, via `resolversConfig.auth`
in each module — these users-permissions actions only gate the REST CRUD
that the Strapi admin UI uses internally.

## Lifecycle Hooks

`src/api/enrollment/content-types/enrollment/lifecycles.ts`:

- **`afterCreate`** → calls Asaas to create a customer + recurring
  subscription, persists `asaasCustomerId` / `asaasSubId` on the
  enrollment. Wrapped in `setImmediate` so the HTTP request isn't
  blocked on the gateway.
- **`afterUpdate`** (status: `cancelled`) → cancels the Asaas
  subscription. Also wrapped in `setImmediate`.

The Asaas webhook (`POST /api/payments/webhook`) is handled by
`src/api/payment/controllers/payment.ts → webhook` and dispatched to
`src/services/asaas-webhook.ts → handle`, which upserts the local
Payment record (idempotent on `externalId`).

## Asaas Integration (Payment Gateway)

Asaas is the Brazilian payment gateway (PIX, boleto, credit card).
Client code lives in `src/services/asaas.ts`; webhook dispatch in
`src/services/asaas-webhook.ts`.

### Flow

1. Admin creates an Enrollment (via Strapi admin or `createEnrollment`
   GraphQL mutation).
2. `afterCreate` calls Asaas → customer + subscription created → IDs
   stored on the enrollment.
3. Asaas generates charges automatically and pushes events to
   `POST /api/payments/webhook`.
4. The webhook upserts the local Payment record. Status changes are
   visible immediately to the website + app via `payments` GraphQL query.

### Asaas API reference

- Base URL: `https://api.asaas.com/v3` (prod) /
  `https://sandbox.asaas.com/api/v3` (sandbox)
- Auth: `access_token` header
- Used endpoints:
  - `POST /customers`
  - `POST /subscriptions`
  - `DELETE /subscriptions/:id`
  - `GET /payments/:id`
- Webhook events handled:
  `PAYMENT_CREATED`, `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`,
  `PAYMENT_OVERDUE`, `PAYMENT_DELETED`, `PAYMENT_REFUNDED`.

The webhook validates an `asaas-access-token` header against the
`ASAAS_WEBHOOK_TOKEN` env var. Invalid tokens get a 401.

## Bootstrap

`src/index.ts`:

- **`register({ strapi })`** — registers the explicit GraphQL schema
  via `registerGraphQL(strapi)`. Must run in `register` (not `bootstrap`)
  so the schema is available before the GraphQL plugin builds it.
- **`bootstrap({ strapi })`** — runs `setupRolesAndPermissions(strapi)`
  on every boot, then optionally `seedDemoData(strapi)` when
  `SEED_DEMO=true`.

### Demo seed (`src/bootstrap/seed.ts`)

Idempotent on the `gym-demo` slug. Creates:
- 1 academy ("Gym Demo", indigo theme, business plan)
- 2 plans (Mensal R$99, Anual R$890)
- 3 students with active enrollments
- 2 class schedules (Musculação Turma A, Pilates Manhã)
- 1 sample workout plan ("Treino A — Peito e Tríceps") for João Silva

Set `SEED_DEMO=false` (or omit it) on subsequent boots once you have real
data.

## File Upload (S3)

`@strapi/provider-upload-aws-s3` is wired in `config/plugins.ts` as the
default. The provider activates whenever `UPLOAD_PROVIDER !== 'local'`.

Configure via env:
- `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`
- `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- `S3_FORCE_PATH_STYLE` (defaults to `true` for non-AWS providers like
  Hetzner / MinIO / Cloudflare R2)

For offline development set `UPLOAD_PROVIDER=local` and Strapi falls back
to the built-in local provider (uploads land in `public/uploads/`).

## config-sync

`strapi-plugin-config-sync` exports core-store, admin roles, and
users-permissions roles to `backend/config/sync/` so configuration
changes travel with the repo.

Workflow:

```bash
# Inside the running Strapi admin
Settings → Config Sync → Export → review the diff in git → commit

# On another env
Settings → Config Sync → Import (after pulling the commit)
```

`importOnBootstrap` is intentionally **off** so a deploy never silently
overwrites permissions — every import is reviewed by hand. OAuth grant
secrets are excluded from sync.

## i18n

Default locale: `pt-BR`. Fields that may need translation in the future:
`Plan.name`, `Plan.description`, `Plan.features`. The i18n plugin is not
enabled yet — add it when a multi-language academy actually requests it.

## Database Indexes

Strapi v5 maintains FKs for relations automatically. The following are
worth adding manually as performance grows:

- `student.email + academy` (unique)
- `academy.slug` (unique — already enforced by the UID type)
- `enrollment.status + academy`
- `payment.dueDate + status`
- `class_booking.date + class_schedule`

## Implementation Status

- [x] Strapi v5 + Postgres + TypeScript scaffold
- [x] All 9 content types with relations
- [x] Roles & permissions bootstrap (academy_admin, instructor, student)
- [x] Asaas client + lifecycle hooks (create / cancel) + webhook handler
- [x] S3 upload provider as default
- [x] GraphQL plugin with explicit schema (shadowCRUD off)
- [x] config-sync plugin
- [x] Demo seed (Gym Demo academy)
- [ ] Multi-language Plan fields (i18n plugin) — not requested yet
- [ ] Dataloader on relation field resolvers — defer until N+1 hurts
