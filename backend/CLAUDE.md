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
- **Nexus arg API:** use `nexus.nonNull(nexus.idArg())` and
  `nexus.nonNull(nexus.arg({ type: 'X' }))` — never
  `nexus.nonNull.idArg()`. That second shape is only valid on output
  fields (`t.nonNull.id('field')`), not on top-level args. TypeScript
  does **not** catch the mistake; the first real Strapi boot will.

### `schema.graphql` is regenerated on every schema change

The full SDL is emitted to `backend/schema.graphql` on every Strapi
boot via `graphql.artifacts.schema = true` (see `config/plugins.ts`).
That file is tracked in git and is the source of truth for the
frontend codegen pipelines in `website/` and `app/`.

**Every commit that changes a GraphQL type module OR a content type
schema must include the regenerated `schema.graphql` diff.** The
workflow:

```bash
cd backend
npm run develop          # let it boot once, then Ctrl-C when the
                         # "To access the server" banner appears
git add schema.graphql
```

No pre-commit hook enforces this today — reviewers catch a missed
regen. See
[`docs/design-decisions.md §9.6`](../docs/design-decisions.md#96-backendschemagraphql-regenerated-on-every-schema-change).

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
4. Extend `src/bootstrap/permissions.ts` with the CRUD actions the
   `academy_admin` / `instructor` / `student` roles should get.
5. Run `npm run develop` once to boot Strapi — this regenerates
   `schema.graphql` and `types/generated/contentTypes.d.ts`.
6. **Run `npm run config:export`** to dump the new content-manager
   configuration + role permissions to `config/sync/*.json`. Both the
   schema change and the sync diff go in the same commit.

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

### When to export

Run `npm run config:export` whenever a commit:

- adds, renames, or removes a content type
- changes the role permissions in `src/bootstrap/permissions.ts`
- adds or edits a custom role
- changes content-manager configuration via the admin UI
- flips a core-store setting (upload provider, users-permissions
  advanced, i18n default locale, etc.)

A PR that modifies any of the above without a matching
`config/sync/*.json` diff is incomplete.

### Workflow

```bash
# 1. Make the change (edit schema.json / permissions.ts / etc.)
cd backend
npm run develop                 # let it boot once, then Ctrl-C

# 2. Export via CLI (preferred — avoids admin-UI round-trips)
npm run config:export           # writes config/sync/*.json
git add config/sync

# 3. Commit both the code change and the sync diff together

# 4. Other environments pull the commit and run:
npm run config:import           # diff-then-apply, non-interactive (-y)
# or inspect first:
npm run config:diff
```

Admin-UI alternative (identical result):
`Settings → Config Sync → Export / Import`.

`importOnBootstrap` is intentionally **off** so a deploy never silently
overwrites permissions — every import is reviewed by hand. OAuth grant
secrets (`plugin_users-permissions_grant`) are excluded from sync.

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

---

## 📋 v2 — Módulo de Controle de Custos

> Planejado para após o MVP. Disponível nos planos **Business** e **Pro**.

### Novo Content Type: `Expense` (Despesa)

| Field         | Type     | Notes                                                              |
|---------------|----------|--------------------------------------------------------------------|
| description   | String   | Ex: "Aluguel de outubro", "Conta de luz"                          |
| amount        | Decimal  | Valor em R$                                                        |
| date          | Date     | Data da despesa/competência                                        |
| category      | Enum     | Ver categorias abaixo                                              |
| type          | Enum     | `fixed` (fixo) / `variable` (variável)                            |
| recurrent     | Boolean  | Se é uma despesa que se repete todo mês                           |
| recurrenceDay | Integer  | Dia do mês para despesas recorrentes (ex: 5 = dia 5 de cada mês) |
| notes         | Text     | Observações livres                                                 |
| receipt       | Media    | Foto/PDF do comprovante (opcional)                                 |
| academy       | Relation | manyToOne Academy                                                  |

**Categorias (`category` enum):**
- `rent` — Aluguel
- `utilities` — Água, luz, internet, telefone
- `payroll` — Salários e encargos
- `equipment` — Equipamentos e manutenção
- `marketing` — Publicidade e marketing
- `supplies` — Material de limpeza e consumo
- `taxes` — Impostos e taxas
- `software` — Sistemas e assinaturas
- `other` — Outros

### Novo Content Type: `FinancialSummary` (cache mensal — opcional)

Tabela de cache para o DRE. Recalculada via cron mensal ou on-demand.

| Field          | Type     | Notes                         |
|----------------|----------|-------------------------------|
| academy        | Relation | manyToOne Academy             |
| month          | Integer  | 1–12                          |
| year           | Integer  | Ex: 2026                      |
| totalRevenue   | Decimal  | Soma de payments pagos no mês |
| totalExpenses  | Decimal  | Soma de expenses do mês       |
| netProfit      | Decimal  | totalRevenue − totalExpenses  |
| fixedCosts     | Decimal  | Soma dos custos fixos         |
| variableCosts  | Decimal  | Soma dos custos variáveis     |

### Novas Custom Routes

```
GET  /api/finance/summary?month=4&year=2026   → DRE simplificado do mês
GET  /api/finance/expenses?month=4&year=2026  → Lista de despesas do mês
POST /api/finance/expenses                    → Cadastrar nova despesa
GET  /api/finance/cashflow?months=6           → Fluxo de caixa últimos N meses
```

### DRE Response Example

```json
{
  "month": 4, "year": 2026,
  "revenue": {
    "total": 18420.00,
    "byPlan": [
      { "plan": "Mensal", "count": 120, "total": 11880.00 },
      { "plan": "Trimestral", "count": 60, "total": 4860.00 },
      { "plan": "Anual", "count": 10, "total": 1680.00 }
    ]
  },
  "expenses": {
    "total": 9800.00,
    "fixed": 7500.00,
    "variable": 2300.00,
    "byCategory": [
      { "category": "rent", "total": 4500.00 },
      { "category": "payroll", "total": 3000.00 },
      { "category": "utilities", "total": 800.00 },
      { "category": "marketing", "total": 900.00 },
      { "category": "other", "total": 600.00 }
    ]
  },
  "netProfit": 8620.00,
  "profitMargin": 46.8
}
```

### Permissões v2

| Role            | Expense access                                |
|-----------------|-----------------------------------------------|
| `academy_admin` | Full CRUD on own academy expenses             |
| `instructor`    | Read-only (opcional, configurável pelo admin) |
| `student`       | Sem acesso                                    |

---

## 📋 v2 — Módulo de Dependentes (Responsável + Aluno Menor)

> Caso de uso: escolas de natação, ballet, artes marciais, ginástica — onde o **responsável** (pai/mãe) faz o cadastro e o pagamento, mas o **praticante** é a criança.

### Modelo de Dados

O `Student` existente representa o **responsável** (quem paga, quem faz login).
Os dependentes são uma nova entidade `Dependent` ligada ao responsável.

### Novo Content Type: `Dependent` (Dependente)

| Field        | Type     | Notes                                                        |
|--------------|----------|--------------------------------------------------------------|
| name         | String   | Nome completo da criança                                     |
| birthdate    | Date     | Data de nascimento (obrigatório)                             |
| photo        | Media    | Foto do dependente                                           |
| relationship | Enum     | `father` / `mother` / `grandparent` / `guardian` / `other`  |
| bloodType    | String   | Tipo sanguíneo (opcional, importante para emergências)       |
| allergies    | Text     | Alergias conhecidas                                          |
| medicalNotes | Text     | Observações médicas relevantes                               |
| guardian     | Relation | manyToOne Student (o responsável)                            |
| academy      | Relation | manyToOne Academy                                            |
| enrollments  | Relation | hasMany Enrollment (matrículas do dependente)                |
| bookings     | Relation | hasMany ClassBooking (aulas do dependente)                   |
| workoutPlans | Relation | hasMany WorkoutPlan (fichas do dependente)                   |
| assessments  | Relation | hasMany BodyAssessment                                       |

**Campos do responsável de emergência (dentro do Dependent):**
| Field                  | Type   | Notes                         |
|------------------------|--------|-------------------------------|
| emergencyContactName   | String | Nome do contato de emergência |
| emergencyContactPhone  | String | Telefone de emergência        |

### Ajustes no `Student` (responsável)

Adicionar campo:
- `isGuardian` — Boolean (default: false) — indica que o aluno é responsável por dependentes
- `dependents` — Relation hasMany Dependent

### Ajuste no `Enrollment`

O enrollment pode pertencer tanto a um `Student` quanto a um `Dependent`:
- `student` — manyToOne Student (nullable)
- `dependent` — manyToOne Dependent (nullable)
- **Regra:** exatamente um dos dois deve estar preenchido
- O **pagamento** sempre fica no responsável (`student`), mesmo que a matrícula seja do dependente

### Ajuste no `Payment`

Adicionar campo:
- `guardian` — manyToOne Student — quem efetivamente paga (útil quando há múltiplos dependentes)

### Lógica de Negócio

1. **Cadastro:** responsável cria conta → adiciona dependentes → matricula cada um num plano
2. **Cobrança:** sempre feita para o responsável (1 cobrança por família, ou por dependente — configurável)
3. **Check-in:** instrutor faz check-in pelo nome da criança
4. **App:** responsável loga e vê todos os dependentes em uma tela unificada
5. **Limite de dependentes:** configurável por plano da academia

### Custom Routes adicionais

```
GET  /api/students/me/dependents           → Lista dependentes do responsável logado
POST /api/students/me/dependents           → Adiciona dependente
GET  /api/dependents/:id/schedule          → Agenda de aulas do dependente
POST /api/dependents/:id/check-in          → Check-in de um dependente
```

### Billing Mode (configurável por Academy)

Campo novo em `Academy`:
- `billingMode` — Enum: `per_student` (padrão) / `per_family`
  - `per_student`: cada dependente tem sua matrícula e cobrança individual
  - `per_family`: cobrança única para o responsável cobre todos os dependentes (plano família)


---

## 🏊 v2 — Módulo Escola de Natação / Controle Diário da Piscina

> Feature opcional para academias/escolas com piscina. Pode ser ativada por tipo de negócio.

### Objetivo
Registrar a qualidade da água e a ocupação da piscina **2x por dia**:
- **08:00**
- **18:00**

### Novo Content Type: `PoolInspection`

| Field             | Type     | Notes |
|------------------|----------|-------|
| date             | Date     | Data da medição |
| shift            | Enum     | `morning` / `evening` |
| scheduledTime    | String   | `08:00` / `18:00` |
| chlorine         | Decimal  | Medição de cloro |
| ph               | Decimal  | Medição de pH |
| temperature      | Decimal  | Temperatura da água |
| peopleCount      | Integer  | Nº de pessoas na piscina |
| peopleCountSource| Enum     | `schedule` / `manual` |
| notes            | Text     | Observações livres |
| status           | Enum     | `ok` / `warning` / `critical` |
| academy          | Relation | manyToOne Academy |
| createdBy        | Relation | users-permissions user |

### Regras de negócio
- Deve existir **1 registro por turno** (`morning` 08:00 e `evening` 18:00) por dia
- `peopleCount` é sugerido automaticamente pela agenda do dia
- Usuário pode editar `peopleCount` manualmente caso o número real seja diferente
- `status` pode ser calculado automaticamente com base em faixas seguras

### Faixas sugeridas de alerta (configuráveis por academia)
- **Cloro**: ideal entre `1.0` e `3.0`
- **pH**: ideal entre `7.2` e `7.8`
- **Temperatura**: faixa ideal configurável (ex.: `28°C` a `31°C`)

### Integração com Agenda
Para preencher `peopleCount` automaticamente:
1. Buscar aulas do dia em `ClassSchedule`
2. Filtrar aulas da modalidade `natacao` / `swimming`
3. Considerar reservas confirmadas por faixa horária
4. Somar alunos previstos para o turno correspondente

### Novas Custom Routes
```
GET  /api/pool-inspections/today               → retorna medições do dia (08h / 18h)
POST /api/pool-inspections                     → cria medição manual
PUT  /api/pool-inspections/:id                 → atualiza medição
GET  /api/pool-inspections/history?from=&to=   → histórico por período
GET  /api/pool-inspections/suggest-people-count?date=YYYY-MM-DD&shift=morning
```

### Ajuste em `Academy`
Adicionar campos opcionais:
- `businessType` — Enum: `gym` / `swimming_school` / `pilates` / `studio` / `martial_arts` / `other`
- `poolModuleEnabled` — Boolean
- `poolPhMin`, `poolPhMax` — Decimal
- `poolChlorineMin`, `poolChlorineMax` — Decimal
- `poolTempMin`, `poolTempMax` — Decimal
- `poolAlertTolerance` — Decimal


### Regras de alerta baseadas em parâmetros ideais
Os alertas usam os parâmetros configurados na `Academy`:
- `poolChlorineMin`, `poolChlorineMax`
- `poolPhMin`, `poolPhMax`
- `poolTempMin`, `poolTempMax`
- `poolAlertTolerance` (opcional)

#### Lógica sugerida
- **OK**: valor dentro da faixa ideal
- **warning**: valor fora da faixa, mas dentro da tolerância
- **critical**: valor muito fora da faixa ideal

#### Exemplo
Se `poolPhMin=7.2`, `poolPhMax=7.8` e `poolAlertTolerance=0.2`:
- `7.4` → `ok`
- `7.1` → `warning`
- `6.8` → `critical`

### Nova rota de configuração
```
GET /api/academies/:id/pool-settings
PUT /api/academies/:id/pool-settings
```


### Integração Agenda → Presença Confirmada → Piscina
A contagem de `peopleCount` no módulo da piscina **não** deve usar apenas reservas/agendamentos.

Ela deve usar **somente alunos com presença confirmada** no turno.

#### Status recomendados em `ClassBooking`
- `scheduled` — agendado
- `confirmed_present` — presença confirmada
- `missed` — faltou
- `cancelled` — cancelado

#### Regra de ocupação da piscina
Para `GET /api/pool-inspections/suggest-people-count?...`:
1. buscar bookings do dia
2. filtrar modalidade natação / piscina
3. filtrar pelo turno (`morning` / `evening`)
4. somar apenas `confirmed_present`


---

## 📥 v2 — Importação em Massa por Planilha

### Objetivo
Permitir que o admin importe rapidamente:
- alunos comuns
- responsáveis + dependentes
- contatos / contas básicas para onboarding

### Formatos aceitos
- `.csv`
- `.xlsx`

### Novo fluxo backend
1. upload do arquivo
2. leitura das colunas
3. mapeamento de campos
4. preview / validação
5. confirmação da importação

### Novas rotas
```
POST /api/imports/students/upload
POST /api/imports/students/preview
POST /api/imports/students/confirm
GET  /api/imports/students/template?mode=students
GET  /api/imports/students/template?mode=family
```

### Modos de importação
#### `students`
Cria registros `Student`

#### `family`
Cria:
- `Student` como responsável
- `Dependent` vinculado ao responsável

### Campos mapeáveis
- `name`
- `phone`
- `email`
- `plan`
- `status`
- `birthdate`
- `importAs` (`student` / `dependent`)
- `guardianName`
- `guardianPhone`
- `guardianEmail`
- `dependentName`
- `dependentBirthdate`
- `relationship`
- `notes`

### Regras de duplicidade
Opções no confirm:
- `skip_duplicates`
- `update_existing`
- `import_anyway`


---

## 📎 v2 — Módulo de Documentos do Aluno / Dependente

### Objetivo
Permitir upload e gestão de documentos importantes de saúde e aptidão.

### Novo Content Type: `StudentDocument`
| Field | Type | Notes |
|---|---|---|
| title | String | Nome do documento |
| type | Enum | `medical_certificate` / `allergy_report` / `health_note` / `other` |
| file | Media | PDF / imagem |
| notes | Text | Observações |
| uploadedBy | Relation | user que enviou |
| student | Relation | Student |
| dependent | Relation | Dependent (opcional) |
| expiresAt | Date | Validade opcional |
| isActive | Boolean | default true |

### Regras
- documento pode pertencer ao aluno ou ao dependente
- documentos vencidos devem aparecer com alerta
- upload permitido para app do responsável/aluno; visualização para admin


### Recebimento manual
O módulo financeiro deve permitir criar `Payment` manualmente.

Campos adicionais sugeridos em `Payment`:
- `source` — `automatic` / `manual`
- `referenceType` — `monthly_fee` / `enrollment_fee` / `single_class` / `fee` / `other`
- `dependent` — Relation opcional

### Nova rota
```
POST /api/payments/manual
```


### Estorno / cancelamento manual
Adicionar suporte a reversão manual de pagamento:
- `refundReason`
- `refundAmount`
- `refundedAt`
- `cancelledAt`

### Desconto / bolsa
Novo conceito para matrícula/plano:
- `discountType` — `amount` / `percentage` / `scholarship`
- `discountValue`
- `discountReason`
- `discountValidUntil`

### Parcelamento manual
Permitir gerar parcelas manuais vinculadas ao aluno/responsável:
- `installmentGroupId`
- `installmentNumber`
- `installmentTotal`


---

## 🧩 Bloco 1 — Personalização do Produto por Segmento e Módulos

### Objetivo
Permitir que cada cliente configure o sistema de acordo com seu segmento e com os módulos que deseja ativar.

### Ajustes em `Academy`
Adicionar campos:
- `businessType` — Enum: `gym` / `swimming_school` / `pilates` / `ballet` / `studio` / `martial_arts` / `other`
- `enabledModules` — JSON array com módulos ativos
- `studentLimitPlan` — Enum: `basic` / `intermediate` / `premium`

### Módulos ativáveis
- `agenda`
- `attendance`
- `finance`
- `documents`
- `dependents`
- `pool`
- `workouts`
- `pedagogy`
- `makeups`
- `resources`
- `communication`
- `digital_signature`
- `indicators`
- `imports`

### Presets por segmento
#### `gym`
Ativar por padrão:
- agenda
- attendance
- finance
- workouts
- documents
- indicators

#### `swimming_school`
Ativar por padrão:
- agenda
- attendance
- finance
- dependents
- documents
- pool
- pedagogy
- makeups
- communication

#### `pilates`
Ativar por padrão:
- agenda
- attendance
- finance
- documents
- resources
- pedagogy
- communication

#### `ballet`
Ativar por padrão:
- agenda
- finance
- dependents
- pedagogy
- documents
- makeups
- digital_signature
- communication

### Novas rotas
```
GET /api/academies/:id/configuration
PUT /api/academies/:id/configuration
POST /api/academies/:id/apply-segment-preset
```

---

## 🧱 Blocos Planejados de Execução

### Bloco 2 — Comunicação / Relacionamento
- avisos para turma inteira
- lembretes de aula
- cobrança de pendências
- lembretes de documento vencendo
- notificações para responsável

### Bloco 3 — Salas / Recursos Físicos
- cadastro de salas / piscina / estúdio / aparelhos
- capacidade por recurso
- indisponibilidade / manutenção
- evitar conflito de agenda por recurso

### Bloco 4 — Evolução Pedagógica
- nível do aluno
- histórico de evolução
- observações técnicas
- mudança de turma por evolução

### Bloco 5 — Reposição de Aula
- pedido de reposição
- saldo de reposição
- encaixe em outra turma
- aprovação automática/manual

### Bloco 6 — Assinatura Digital / Termos
- contrato
- termo de responsabilidade
- autorização de imagem
- autorização para menor

### Bloco 7 — Metas e Indicadores
- alunos ativos
- inadimplência
- ocupação de turmas
- ticket médio
- retenção / evasão
- receita por modalidade
- lucro


---

## 🧩 Bloco 3 — Salas / Recursos Físicos

### Objetivo
Controlar salas, piscinas, estúdios e aparelhos para evitar conflitos e melhorar a operação.

### Novo Content Type: `ResourceSpace`
| Field | Type | Notes |
|---|---|---|
| name | String | Nome do recurso, ex.: Sala 1, Piscina Principal |
| type | Enum | `room` / `pool` / `studio` / `equipment_area` / `other` |
| capacity | Integer | Capacidade máxima |
| isActive | Boolean | Se está disponível |
| notes | Text | Observações |
| academy | Relation | manyToOne Academy |

### Regras
- turmas podem ser vinculadas a um recurso físico
- sistema deve evitar conflito de horário no mesmo recurso
- recurso pode ser marcado como indisponível para manutenção

### Rotas
```
GET /api/resources
POST /api/resources
PUT /api/resources/:id
POST /api/resources/:id/block
```


---

## 🧩 Bloco 5 — Reposição de Aula

### Objetivo
Controlar faltas e permitir reposições em outras turmas/horários.

### Novo Content Type: `MakeupCredit`
| Field | Type | Notes |
|---|---|---|
| student | Relation | Student |
| dependent | Relation | Dependent (opcional) |
| originBooking | Relation | booking que gerou o crédito |
| reason | Enum | `absence` / `academy_cancelled` / `other` |
| expiresAt | Date | validade do crédito |
| status | Enum | `open` / `used` / `expired` / `cancelled` |
| academy | Relation | Academy |

### Rotas
```
GET /api/makeups
POST /api/makeups
POST /api/makeups/:id/use
```

---

## 🧩 Bloco 4 — Evolução Pedagógica

### Objetivo
Acompanhar progresso do aluno por nível/habilidade.

### Novo Content Type: `StudentProgress`
| Field | Type | Notes |
|---|---|---|
| student | Relation | Student |
| dependent | Relation | Dependent (opcional) |
| level | String | Ex: Golfinho, Tubarão, Intermediário |
| skills | JSON | habilidades / checklist |
| notes | Text | observações técnicas |
| evaluatedAt | Date | data da avaliação |
| instructor | String | avaliador |
| academy | Relation | Academy |

---

## 🧩 Bloco 2 — Comunicação / Relacionamento

### Objetivo
Enviar avisos e lembretes para alunos/responsáveis.

### Novo Content Type: `CommunicationLog`
| Field | Type | Notes |
|---|---|---|
| targetType | Enum | `student` / `guardian` / `class` / `all` |
| messageType | Enum | `reminder` / `warning` / `marketing` / `document_request` |
| channel | Enum | `push` / `email` / `whatsapp` / `internal` |
| title | String | assunto |
| body | Text | conteúdo |
| sentAt | DateTime | quando foi enviado |
| status | Enum | `draft` / `sent` / `failed` |
| academy | Relation | Academy |

---

## 🧩 Bloco 7 — Metas e Indicadores

### Objetivo
Exibir indicadores gerenciais para o dono.

### Indicadores sugeridos
- alunos ativos
- inadimplência
- ocupação de turmas
- ticket médio
- retenção / evasão
- receita por modalidade
- lucro
- conversão de experimental

---

## 🧩 Bloco 6 — Assinatura Digital / Termos

### Objetivo
Coletar aceite digital de contratos e autorizações.

### Novo Content Type: `SignedTerm`
| Field | Type | Notes |
|---|---|---|
| student | Relation | Student |
| dependent | Relation | Dependent (opcional) |
| termType | Enum | `contract` / `image_release` / `liability` / `minor_authorization` |
| signedBy | String | nome do responsável |
| signedAt | DateTime | data/hora |
| file | Media | PDF do termo |
| isValid | Boolean | controle |
| academy | Relation | Academy |
