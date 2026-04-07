# Gym — Backend Architecture (Strapi v5)

## Stack
- **Strapi v5** (latest stable)
- **PostgreSQL** (primary database)
- **Node.js 20+**
- **TypeScript** (enabled)

## Setup

```bash
npx create-strapi-app@latest . --typescript --no-run
# or if already scaffolded:
npm install
npm run develop
```

## Content Types

All content types belong to an **Academy** (multi-tenant isolation).

---

### 🏫 Academy
The root tenant entity.

| Field         | Type        | Notes                                      |
|---------------|-------------|--------------------------------------------|
| name          | String (req)| Academy display name                       |
| slug          | UID         | Auto-generated from name, used as subdomain|
| logo          | Media       | Academy logo image                         |
| primaryColor  | String      | Hex color, e.g. `#FF5722`                  |
| secondaryColor| String      | Hex color                                  |
| plan          | Enum        | `starter` / `business` / `pro`             |
| isActive      | Boolean     | Default: true                              |
| email         | Email       | Admin contact                              |
| phone         | String      |                                            |
| address       | Text        |                                            |
| students      | Relation    | hasMany Student                            |
| plans         | Relation    | hasMany Plan                               |
| schedules     | Relation    | hasMany ClassSchedule                      |

---

### 👤 Student
Academy member (aluno).

| Field     | Type     | Notes                                        |
|-----------|----------|----------------------------------------------|
| name      | String   |                                              |
| email     | Email    | Unique per academy                           |
| phone     | String   |                                              |
| photo     | Media    |                                              |
| birthdate | Date     |                                              |
| status    | Enum     | `active` / `inactive` / `suspended`          |
| notes     | Text     |                                              |
| academy   | Relation | manyToOne Academy                            |
| user      | Relation | oneToOne users-permissions.user (for login)  |
| enrollments | Relation | hasMany Enrollment                         |

---

### 💳 Plan (Plano de Matrícula)
What students subscribe to.

| Field        | Type    | Notes                                   |
|--------------|---------|-----------------------------------------|
| name         | String  | e.g. "Mensal", "Trimestral", "Anual"    |
| description  | Text    |                                         |
| price        | Decimal |                                         |
| billingCycle | Enum    | `monthly` / `quarterly` / `annual`      |
| maxStudents  | Integer | null = unlimited                        |
| features     | JSON    | Array of feature strings                |
| isActive     | Boolean |                                         |
| academy      | Relation| manyToOne Academy                       |

---

### 📋 Enrollment (Matrícula)
Links a student to a plan.

| Field         | Type     | Notes                                       |
|---------------|----------|---------------------------------------------|
| student       | Relation | manyToOne Student                           |
| plan          | Relation | manyToOne Plan                              |
| startDate     | Date     |                                             |
| endDate       | Date     |                                             |
| status        | Enum     | `active` / `cancelled` / `expired`          |
| paymentMethod | Enum     | `pix` / `credit_card` / `boleto`            |
| asaasCustomerId | String | Asaas customer ID for recurring billing     |
| asaasSubId    | String   | Asaas subscription ID                       |

---

### 📅 ClassSchedule (Grade de Aulas)
A recurring class slot.

| Field       | Type    | Notes                                         |
|-------------|---------|-----------------------------------------------|
| name        | String  | e.g. "Musculação Turma A", "Pilates Manhã"    |
| instructor  | String  |                                               |
| modality    | Enum    | `presential` / `online`                       |
| weekdays    | JSON    | Array of ints: [1,3,5] = Mon/Wed/Fri          |
| startTime   | String  | "06:00"                                       |
| endTime     | String  | "07:00"                                       |
| maxCapacity | Integer |                                               |
| room        | String  | Optional room/location                        |
| isActive    | Boolean |                                               |
| academy     | Relation| manyToOne Academy                             |

---

### 🎟️ ClassBooking (Agendamento)
A student's booking for a specific class date.

| Field         | Type     | Notes                                      |
|---------------|----------|--------------------------------------------|
| student       | Relation | manyToOne Student                          |
| classSchedule | Relation | manyToOne ClassSchedule                    |
| date          | Date     | Specific occurrence date                   |
| status        | Enum     | `confirmed` / `cancelled` / `attended` / `missed` |
| checkedInAt   | DateTime | Timestamp of check-in                      |

---

### 💰 Payment (Pagamento)

| Field      | Type     | Notes                                           |
|------------|----------|-------------------------------------------------|
| enrollment | Relation | manyToOne Enrollment                            |
| amount     | Decimal  |                                                 |
| dueDate    | Date     |                                                 |
| paidAt     | DateTime |                                                 |
| status     | Enum     | `pending` / `paid` / `overdue` / `cancelled`    |
| method     | Enum     | `pix` / `credit_card` / `boleto`                |
| externalId | String   | Asaas payment ID                                |
| receiptUrl | String   | Link to receipt/boleto PDF                      |

---

### 🏋️ WorkoutPlan (Ficha de Treino)

| Field      | Type     | Notes                                        |
|------------|----------|----------------------------------------------|
| name       | String   | e.g. "Treino A — Peito e Tríceps"            |
| student    | Relation | manyToOne Student                            |
| instructor | String   |                                              |
| exercises  | JSON     | Array of { name, sets, reps, load, notes }   |
| validFrom  | Date     |                                              |
| validTo    | Date     |                                              |
| isActive   | Boolean  |                                              |

---

### 📏 BodyAssessment (Avaliação Física)

| Field        | Type     | Notes                                       |
|--------------|----------|---------------------------------------------|
| student      | Relation | manyToOne Student                           |
| instructor   | String   |                                             |
| date         | Date     |                                             |
| weight       | Decimal  | kg                                          |
| height       | Decimal  | cm                                          |
| bodyFat      | Decimal  | %                                           |
| measurements | JSON     | { chest, waist, hips, arms, thighs, ... }   |
| notes        | Text     |                                             |

---

## Roles & Permissions (users-permissions plugin)

| Role          | Access                                                       |
|---------------|--------------------------------------------------------------|
| `super_admin` | Full Strapi admin (platform owner)                           |
| `academy_admin` | Full CRUD on their own academy's data (filtered by academy) |
| `instructor`  | Read students, manage schedules, write assessments           |
| `student`     | Read own data, book classes, view own workouts               |
| `public`      | Read academy branding config (slug, logo, colors)            |

**Important:** All controllers must filter by the authenticated user's academy to ensure data isolation.

## Custom API Routes

```
GET  /api/academies/by-slug/:slug    → Public: returns branding config
POST /api/payments/webhook           → Asaas webhook handler
GET  /api/students/me                → Returns authenticated student's full profile
GET  /api/schedules/:id/bookings     → Returns bookings for a specific date
POST /api/bookings/:id/check-in      → Mark attendance
```

## Plugins to Install

```bash
# Already included in Strapi v5:
# - @strapi/plugin-users-permissions
# - @strapi/plugin-upload
# - @strapi/plugin-i18n (optional)

# Add:
npm install @strapi/provider-upload-aws-s3  # for S3 storage
```

## Asaas Integration (Payment Gateway)

Asaas is the preferred Brazilian payment gateway (supports PIX, boleto, credit card).

### Flow
1. When a new Enrollment is created → call Asaas API to create customer + subscription
2. Asaas generates charges automatically
3. Asaas sends webhook → `POST /api/payments/webhook`
4. Webhook updates Payment record status

### Asaas API Reference
- Base URL: `https://api.asaas.com/v3` (prod) / `https://sandbox.asaas.com/api/v3` (sandbox)
- Auth: `access_token` header
- Key endpoints:
  - `POST /customers` — create customer
  - `POST /subscriptions` — create recurring subscription
  - `GET /payments?subscription=<id>` — list payments for subscription
  - Webhook events: `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED`

## Lifecycle Hooks

- `Enrollment.afterCreate` → create Asaas customer + subscription, link IDs
- `Enrollment.afterUpdate` (status: cancelled) → cancel Asaas subscription
- `Payment.afterCreate` (via webhook) → update enrollment status if all paid

## i18n

Default locale: `pt-BR`. Fields that need translation: Plan.name, Plan.description, Plan.features.

## Database Indexes

Add indexes for:
- `student.email + academy` (unique)
- `academy.slug` (unique)
- `enrollment.status + academy`
- `payment.dueDate + status`
- `classBooking.date + classSchedule`

## Implementation Order

1. Set up Strapi project (typescript, postgres)
2. Create content types in order: Academy → Plan → Student → Enrollment → ClassSchedule → ClassBooking → Payment → WorkoutPlan → BodyAssessment
3. Configure roles & permissions
4. Add custom routes (by-slug, webhook, check-in)
5. Implement Asaas lifecycle hooks
6. Configure S3 upload provider
7. Seed demo data (1 academy "Gym Demo", 3 students, 2 plans, sample schedule)
