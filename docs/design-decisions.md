# Gym — Design Decisions

The single source of truth for **why** things are the way they are. Every
non-obvious choice lives here so future iterations don't have to re-argue
the same ground.

> ### Keeping this file current is a hard rule.
>
> This file is not a retrospective document — it is updated **in the same
> commit** that introduces a new decision. See
> [`CLAUDE.md → Working conventions → 1. Design decisions are always
> documented`](../CLAUDE.md#working-conventions) for the full rule.
>
> A "non-obvious decision" is anything where:
> - You chose one option over a defensible alternative.
> - You rejected something the reader might reasonably expect you to use.
> - You accepted a tradeoff that will matter in the next 6 months.
> - A future session would otherwise have to rediscover the reasoning.
>
> If any of those are true, add the entry. Don't batch. Don't leave it
> for "later". "Later" is how drift happens.

Format per entry:
- **Decision** — one sentence.
- **Context** — what problem prompted it.
- **Rationale** — *why* this specific answer.
- **Consequences** — the tradeoffs we accepted.
- **Revisit when** — the signal that would make us reconsider.

Entries are grouped by area. If you reopen a decision, don't delete the
entry — mark it `[SUPERSEDED by #XX on YYYY-MM-DD]` and add the new one
right below. We want the history, not a clean slate.

---

## Table of contents

1. [Architecture](#1-architecture)
2. [Backend / Strapi](#2-backend--strapi)
3. [GraphQL API](#3-graphql-api)
4. [Website (marketing + admin)](#4-website-marketing--admin)
5. [Student app (Expo)](#5-student-app-expo)
6. [Visual design system](#6-visual-design-system)
7. [Copy + brand voice](#7-copy--brand-voice)
8. [SEO strategy](#8-seo-strategy)
9. [Tooling + DX](#9-tooling--dx)
10. [Rejected options](#10-rejected-options)

---

## 1. Architecture

### 1.1 Split the frontend into `website/` and `app/`

- **Decision** — The marketing site + academy admin panel live in
  `website/` (Next.js). The student-facing experience lives in `app/`
  (Expo / React Native). They are sibling projects, not sub-routes of
  one mega-app.
- **Context** — The original scaffold put everything in a single
  `frontend/` Next.js project, with the student app as a `[subdomain]`
  route group.
- **Rationale** — The three surfaces have almost nothing in common past
  the brand. Marketing is SEO-driven, public, desktop-first. Admin is
  authenticated, desktop-first, table-heavy. The student app is
  authenticated, mobile-first, needs push notifications, biometric
  login, offline resilience, and installable from the store. Stuffing
  them into one Next.js project forced the student experience into a
  browser PWA and gave every marketing visitor the admin bundle.
- **Consequences** — Two deploys instead of one; two `apollo.ts` files;
  shared components need to be copy-pasted or extracted to a package
  later. We explicitly accept that cost to ship a real mobile app.
- **Revisit when** — The shared component count passes ~10 and the
  duplication hurts more than the split helps. At that point, extract a
  `packages/ui/` workspace.

### 1.2 Expo (React Native), not Next.js, for the student app

- **Decision** — `app/` is scaffolded with `npx create-expo-app` using
  expo-router, NativeWind, expo-secure-store, expo-notifications,
  expo-image, and EAS Update.
- **Context** — The first draft of `app/CLAUDE.md` documented Next.js
  for the student app. The user explicitly called it out and asked for
  Expo.
- **Rationale** — The student app is the daily-use surface for real gym
  members. They need:
  - Install from the store (not "add to home screen")
  - Push notifications (class reminders, payment due)
  - Biometric auth (Face ID / Android BiometricPrompt)
  - Secure storage for the JWT (keychain, not `localStorage`)
  - Camera for progress photos
  - Reliable performance on older Android phones in low-signal gyms
  None of those are comfortable in a browser PWA. Expo gives us all of
  them with a single TypeScript codebase + OTA JS updates via EAS.
- **Consequences** — Two completely different build pipelines. The
  marketing site uses Vercel + Next.js; the app uses EAS Build. Some
  copy gets duplicated between `website/` and `app/` (login forms,
  error messages). We pay that cost.
- **Revisit when** — Someone proposes reverting to a PWA. The answer
  should stay "no" unless push notifications, Face ID, and store
  presence stop mattering.

### 1.3 Strapi v5 + PostgreSQL + TypeScript for the backend

- **Decision** — The backend is Strapi v5 (TypeScript) on Postgres.
- **Rationale** — Strapi gives us the admin UI for free, content-type
  modeling matches our domain, and the users-permissions plugin covers
  the auth surface we need. Postgres is the only reasonable default for
  multi-tenant production data. TypeScript is non-negotiable for a
  codebase this size.
- **Consequences** — We inherit Strapi's quirks (opinionated folder
  layout, custom GraphQL integration via Nexus). We accept them because
  the alternative is writing an admin UI by hand.
- **Revisit when** — Strapi introduces a breaking change we can't
  upgrade past, or multi-tenancy performance problems prove fundamental
  to the query layer.

### 1.4 Multi-tenancy via `Academy` relations, not separate databases

- **Decision** — One Postgres database, one Strapi instance. Every
  content type belongs to an `Academy`, and list resolvers filter by
  the authenticated user's academy.
- **Rationale** — At this scale (hundreds of academies, not thousands),
  per-tenant databases would triple ops cost for zero isolation
  benefit. Row-level tenant scoping via relations + a scoping helper
  (`resolveUserAcademyId`) is simpler and auditable.
- **Consequences** — We have to be disciplined about filtering in every
  resolver. The GraphQL helper `withAcademyScope` exists specifically
  so we can't forget. A missed filter leaks cross-tenant data — that's
  the nightmare scenario.
- **Revisit when** — A specific academy (or a compliance requirement)
  demands physical isolation. At that point we fork into a dedicated
  Strapi instance for that tenant — the schema is unchanged, only the
  connection string differs.

---

## 2. Backend / Strapi

### 2.1 Plugins: users-permissions, graphql, config-sync, upload-aws-s3

- **Decision** — The backend enables four plugins beyond Strapi's
  defaults: users-permissions (JWT auth), graphql (data API),
  strapi-plugin-config-sync (env-to-env config transfer), and
  @strapi/provider-upload-aws-s3 (S3-compatible uploads).
- **Rationale** — Each earns its place:
  - **users-permissions** — the only sensible auth surface for Strapi v5
  - **graphql** — explicit mandate from the user (see §3.1)
  - **config-sync** — permission changes have to travel with the repo,
    not live in the dev database where they get lost on a reset
  - **upload-aws-s3** — we need S3 for production; the provider is
    native to Strapi and non-controversial
- **Consequences** — `config-sync` runs at boot but **never** imports
  automatically (`importOnBootstrap: false`). Every sync is reviewed
  manually via the admin UI. This is deliberate — a silent permission
  import on deploy is how you accidentally nuke production auth.
- **Revisit when** — A new Strapi plugin lets us drop one of these
  (e.g., if a built-in config sync appears).

### 2.2 S3 is the default upload provider; local is the fallback

- **Decision** — `config/plugins.ts` wires `aws-s3` by default. Setting
  `UPLOAD_PROVIDER=local` falls back to the local filesystem provider.
- **Context** — Original draft had the conditional inverted (local
  default, S3 opt-in).
- **Rationale** — The default should reflect production intent. Dev
  machines don't have S3 creds, so they opt into local via `.env`; prod
  gets the right behavior without extra config.
- **Consequences** — A fresh `backend/.env` that forgets to set
  `UPLOAD_PROVIDER=local` will crash at upload time with an unhelpful
  S3 error. The `.env.example` is explicit about this.
- **Revisit when** — We ship a bundled local dev container — then the
  dev default should be `local` again.

### 2.3 Enrollment lifecycle hooks fire Asaas calls via `setImmediate`

- **Decision** — `Enrollment.afterCreate` calls Asaas to create a
  customer + subscription, wrapped in `setImmediate(async () => { … })`
  so the HTTP response isn't blocked on the gateway.
- **Rationale** — Asaas API calls are ~400-800ms round-trip from
  Brazil. Blocking the enrollment create response on them would make
  the admin feel broken. Fire-and-forget + idempotent retry on failure
  is the right pattern. Errors are logged, not thrown.
- **Consequences** — If Asaas is down when an enrollment is created,
  the local record exists but has no `asaasCustomerId`/`asaasSubId`.
  There's no automatic retry today — manual rerun via the admin UI is
  expected.
- **Revisit when** — We add a BullMQ worker. Then this should move to a
  proper queued job with exponential backoff.

### 2.4 `asaasCustomerId` and `asaasSubId` marked `private: true`

- **Decision** — The Asaas foreign keys on `Enrollment` are
  `private: true` in the Strapi schema and are **not** defined in the
  GraphQL type.
- **Rationale** — They're payment-gateway internals. Leaking them via
  REST or GraphQL creates a supply-chain risk (attackers can fingerprint
  customer records at the gateway). Keep them strictly server-side.
- **Consequences** — Any feature that needs to surface Asaas IDs has to
  go through a dedicated backend route that is audited. Fine.
- **Revisit when** — Never, unless Asaas IDs become non-sensitive (they
  won't).

### 2.5 Roles seeded by `src/bootstrap/permissions.ts` (idempotent)

- **Decision** — Three custom roles (`academy_admin`, `instructor`,
  `student`) are seeded at every boot. The code checks for existing
  roles first so it's safe to run repeatedly.
- **Rationale** — Permissions are part of the application contract and
  should travel with the code, not with a manual setup checklist.
- **Consequences** — If someone edits a role via the admin UI, the
  bootstrap helper won't overwrite it (it only creates missing roles).
  This is a feature, not a bug — it lets ops tweak without losing
  changes on redeploy.
- **Revisit when** — A role blueprint changes in a way that must
  propagate. Then the bootstrap has to do a diff-based upsert, and we
  should use `config-sync` as the transport instead.

---

## 3. GraphQL API

### 3.1 GraphQL is the only data API; REST is reserved for auth + webhooks

- **Decision** — Every data query and mutation from `website/` and
  `app/` goes through `POST /graphql`. REST stays only for
  users-permissions auth endpoints and the Asaas webhook.
- **Rationale** — The user mandated "GraphQL for all app communications"
  and the global CLAUDE.md preference has always been Apollo. GraphQL
  makes the client-server contract explicit, enables Apollo's
  normalized cache (critical on the mobile app where data stays put),
  and gives us codegen for the TypeScript types.
- **Consequences** — We can't use Strapi's REST conveniences. Every
  content type has to be defined twice — once in the Strapi schema.json
  and once as an explicit GraphQL type (see §3.2). Custom queries live
  in their own module and require manual resolver wiring.
- **Revisit when** — Never, unless GraphQL itself is deprecated or the
  codegen+cache story becomes worse than REST + TanStack Query (it
  won't).

### 3.2 `shadowCRUD: false` — every GraphQL type is explicit

- **Decision** — `@strapi/plugin-graphql` is configured with
  `shadowCRUD: false`, and the full schema is defined in
  `backend/src/extensions/graphql/` — one module per content type.
- **Context** — Strapi's default is shadowCRUD on, which auto-generates
  types from the content-type schemas. It's convenient but leaks
  everything.
- **Rationale** — Three hard reasons:
  1. **No accidental field leaks.** Adding a new field to the Strapi
     schema should be an explicit GraphQL decision, not automatic.
     `asaasCustomerId` exists — if shadowCRUD were on, one schema edit
     would expose it to the public API.
  2. **`documentId` only, never the numeric PK.** Shadow CRUD exposes
     the internal `id` field alongside `documentId`, and Apollo clients
     inevitably start keying on it, creating coupling to the database
     layout. We use only `documentId`.
  3. **Auth is per-resolver, not per-content-type.** With explicit
     resolvers, each one has its own entry in `resolversConfig` with
     `auth: true/false` — impossible to forget.
- **Consequences** — Roughly 1000 lines of explicit schema code
  (~100-150 per content type) that would otherwise be free. Adding a
  new field is a two-file edit: schema.json + graphql/types/xxx.ts.
- **Revisit when** — Never. This is the gold standard for GraphQL in a
  multi-tenant product.

### 3.3 Relation fields resolve lazily (re-fetch with populate)

- **Decision** — Each relation field on a GraphQL type has its own
  resolver that re-fetches the parent document with the needed
  `populate`. No eager loading in the list query.
- **Rationale** — Simplicity. Strapi's GraphQL extension API doesn't
  have clean dataloader integration, and list queries shouldn't be
  forced to know which relations the client will ask for. Lazy
  resolution keeps each query focused.
- **Consequences** — N+1 queries. For a list of 25 enrollments each
  with a student + plan, we make 1 + 25×2 = 51 database queries where
  a smart loader would make 3.
- **Revisit when** — N+1 queries hurt in production (likely first on
  admin tables with >50 rows). At that point, add a dataloader layer
  in `helpers.ts` that batches within a single GraphQL request.

### 3.4 Auth defaults to required; only `academyBySlug` is public

- **Decision** — In `resolversConfig`, every query and mutation defaults
  to `{ auth: true }`. The sole exception is `Query.academyBySlug`.
- **Rationale** — Defaulting to public is how you leak data. Defaulting
  to auth means the worst case of forgetting to set it is a 401, not a
  privacy incident. `academyBySlug` is public because the apps need it
  to theme the page *before* the student logs in (otherwise the login
  screen would be un-branded).
- **Consequences** — Any future unauthenticated surface has to be added
  explicitly. Good.
- **Revisit when** — Never.

### 3.5 Custom queries: `me`, `scheduleBookings`, `checkInBooking`

- **Decision** — Four custom queries/mutations on top of the standard
  CRUD: `academyBySlug` (public), `me` (auth student profile),
  `scheduleBookings` (bookings on a date), `checkInBooking` (mark
  attendance).
- **Rationale** — These are operations that don't map cleanly to
  generic CRUD — `me` resolves the student from the JWT, `checkIn`
  updates two fields atomically, `scheduleBookings` has an optional
  date filter. Making them top-level fields keeps the client code
  simple.
- **Consequences** — Four more hand-written resolvers to maintain.
- **Revisit when** — A custom query becomes complex enough to deserve
  its own module outside `types/`.

---

## 4. Website (marketing + admin)

### 4.1 Next.js 16 (Tailwind v4, React 19)

- **Decision** — The website is scaffolded with `create-next-app@latest`,
  which at scaffold time resolved to **Next.js 16.2.x** with **Tailwind
  CSS v4**, **React 19**, and Turbopack as the dev/build engine.
- **Context** — An earlier draft of the website doc pinned Next.js 14.
  When we actually scaffolded, `create-next-app@latest` jumped to 16 and
  `npm run build` succeeded on the first try with Apollo Client + codegen
  already wired in.
- **Rationale** — 16 is the current stable, the App Router mental model
  is unchanged from 14, Turbopack is now the default, and React 19 plays
  cleanly with Apollo Client 4. Downgrading to 14 would mean fighting
  the tooling for no concrete benefit.
- **Consequences** — Tailwind v4 has a slightly different config story
  (`@tailwindcss/postcss` plugin instead of `tailwind.config.js`), and
  some shadcn/ui presets still default to v3. Acceptable — we'll tune
  per-component as we add shadcn primitives.
- **Revisit when** — Next.js 17+ changes the App Router in a
  breaking way, or a shadcn/ui compatibility issue blocks us on v4.

### 4.2 Apollo Client 4, not TanStack Query

- **Decision** — The website uses Apollo Client 4 as both data layer
  and cache.
- **Rationale** — Once the API is GraphQL, the normalized cache is the
  killer feature — especially for the admin tables where the same
  Student appears in list, detail, and related views. TanStack Query
  would force us to rebuild that ourselves.
- **Consequences** — Apollo's mental model (`keyFields`, fragments,
  optimistic updates) is heavier than TanStack's. Onboarding cost
  acceptable.

### 4.3 Marketing + admin in one Next.js project

- **Decision** — `/` and `/admin/*` live in the same project, sharing
  the same Tailwind config, components folder, and Apollo client.
- **Rationale** — They share brand, components (buttons, dialogs,
  forms), and the fact that an admin clicking "Sign in" from the
  landing should not reload a new app. Separating them would mean
  duplicating `lib/`, `components/ui/`, and `tailwind.config.ts`.
- **Consequences** — The marketing bundle includes the admin chunks
  (tree-shaken but still present). Acceptable until the admin chunk
  grows past ~200KB.
- **Revisit when** — Marketing Core Web Vitals suffer from the admin
  bundle. Then extract admin to its own project.

### 4.4 Apollo cache `keyFields: ['documentId']`

- **Decision** — Every typePolicy in Apollo's `InMemoryCache` is
  explicitly keyed on `documentId`.
- **Rationale** — Strapi's document IDs are stable UUIDs. Apollo
  defaults to `id` which doesn't exist in our schema (see §3.2), so
  caching would silently break.
- **Consequences** — One-line per content type in the cache config.
- **Revisit when** — Never.

### 4.5 GraphQL Code Generator with the `client` preset

- **Decision** — Both `website/` and `app/` use `@graphql-codegen/cli`
  with `@graphql-codegen/client-preset`. Config lives in `codegen.ts`
  at each project root, output lands in `src/gql/` (website) and
  `gql/` (app). The `graphql()` helper is imported from there and used
  to tag query strings — Apollo Client 4's `useQuery` picks up the
  generated types automatically.
- **Context** — Two alternatives were considered:
  1. Per-operation plugins (`typescript`, `typescript-operations`,
     `typescript-react-apollo`) that emit a named hook per query.
  2. Client preset — emits a single `graphql()` function that you wrap
     your query strings in. Types flow through from there.
- **Rationale** — The client preset is the modern default from the
  GraphQL Code Generator maintainers and plays perfectly with Apollo
  Client 4. It's less verbose, avoids the "useXxxQuery" hook explosion,
  and co-locates the query text with the component that uses it
  without losing type safety.
- **Consequences** — Every new query goes through `npm run codegen`
  (or the `codegen:watch` variant during dev). The `gql/` output is
  committed so fresh clones and CI don't need codegen to run before
  type-checking.
- **Revisit when** — The client preset stops being the GraphQL codegen
  team's recommended pattern.

### 4.6 Canonical GraphQL schema committed as `backend/schema.graphql`

- **Decision** — The Strapi GraphQL plugin is configured with
  `artifacts.schema: true`. Every backend boot writes the full SDL to
  `backend/schema.graphql`. That file is tracked in git.
- **Rationale** — Frontend codegen needs a schema source. Introspection
  against a running backend is fragile (CI has to boot Strapi first,
  dev has to remember the backend is running); committing the SDL
  makes codegen deterministic and reviewable. Schema changes show up
  as line diffs in pull requests — API breakage is impossible to miss.
- **Consequences** — When a backend schema edit ships, the author has
  to regenerate the artifact (by running Strapi once) and commit the
  diff. There's no automatic pre-commit hook for this today.
- **Revisit when** — A pre-commit hook becomes worth it (probably after
  the second or third "I forgot to regen the schema" merge conflict).

### 4.7 Demo mode toggle (mock-vs-API at build time)

- **Decision** — The website ships with a `NEXT_PUBLIC_USE_MOCKS` flag
  (default `true`) that routes every data-fetching hook through typed
  fixtures in `src/lib/mock-data.ts` instead of Apollo. The Apollo
  provider degrades to a React pass-through in mock mode so no client
  is instantiated against a missing endpoint.
- **Context** — When we ported all the marketing and admin pages from
  `mockups/`, a fresh clone couldn't render anything without also
  booting Strapi + Postgres. That's too much friction for design review
  iterations, Figma-to-code comparisons, and newcomers cloning the repo
  to poke at the UI.
- **Rationale** — The `app/` project already solved this in commit
  `18f8c22` with the same pattern (`EXPO_PUBLIC_USE_MOCKS`,
  `lib/mock-data.ts`, conditional hook exports). Copying the pattern
  verbatim keeps both frontends consistent and means the same mental
  model applies across the monorepo. Build-time flag (not runtime) is
  deliberate: Next.js inlines `NEXT_PUBLIC_*` so the branch is stable
  across renders and satisfies rules-of-hooks.
- **Consequences** — Every page-level hook lives in `src/lib/hooks.ts`
  and has two branches: `useMocked(MOCK_X)` and a `notImplemented()`
  stub for the API path. When a page gets real data wiring, its hook's
  API branch is replaced with an Apollo `useQuery` call and a mapper
  into the domain shape from `src/lib/types.ts`. The mock shapes are
  decoupled from the GraphQL schema on purpose — they're the shape a
  component wants to render, not the shape the backend emits.
- **Revisit when** — Every hook has a real API branch and mock mode
  becomes pure dead code. At that point we can either delete the
  toggle or keep it as a Storybook-style preview mode. Probably keep
  it — a zero-dep "clone and see the app" workflow is worth ~200 lines
  of fixture data.

### 4.8 Hand-rolled UI primitives (no shadcn/ui, for now)

- **Decision** — `src/components/ui/` is a small, hand-rolled set of
  primitives (`Button`, `Card`, `Pill`, `Icon`, `Field`, `Eyebrow`,
  `SectionHeader`, `Brand`) built directly on Tailwind v4 utility
  classes and the paper/ink/flame tokens.
- **Context** — The earlier website CLAUDE.md named shadcn/ui as a
  planned dependency. When porting the mockups, every primitive needed
  the exact paper/ink/flame aesthetic, the exact rounded-full buttons,
  the mono eyebrows, the `grain::before` texture, etc. Every shadcn
  primitive would have had to be overridden anyway.
- **Rationale** — shadcn/ui shines when you want a solid default that
  you occasionally customise. Our mockups are not "default + tweaks" —
  they're a very opinionated design system. Starting from primitives
  that already look wrong costs more than writing eight small React
  components. Accessibility-critical primitives (`Dialog`, `Popover`,
  `Combobox`) will almost certainly come from Radix when we need them,
  but that's incremental — we don't need the whole shadcn scaffolding
  to add one Radix primitive.
- **Consequences** — New primitives are added as needed in
  `src/components/ui/`. When we hit a complex interaction (focus trap,
  keyboard navigation, portal-based popover) that would be expensive
  to hand-roll, the fix is to install the specific Radix package and
  wrap it — not to install the full shadcn CLI.
- **Revisit when** — We need 3+ primitives with complex a11y
  requirements (Dialog + Popover + Combobox), OR the hand-rolled
  primitives start drifting out of sync with the design system.

### 4.9 Tailwind v4 `@theme` as the token source of truth

- **Decision** — All design tokens (colors, radii, fonts, shadows)
  live inside a single `@theme` block at the top of
  `src/app/globals.css`. Tailwind v4 turns these into utility classes
  (`bg-paper`, `text-flame`, `rounded-[var(--radius-lg)]`) and CSS
  custom properties that are accessible from any `style` attribute.
- **Context** — `mockups/design-system.css` already had ~40 CSS
  variables. We considered two alternatives: (1) a `tailwind.config.ts`
  with a JS `theme.extend.colors` mapping, or (2) a shared CSS module
  with utility classes layered on top of Tailwind.
- **Rationale** — Tailwind v4 explicitly recommends `@theme` as the
  config mechanism — JS config is now the fallback. `@theme` lets us
  keep tokens as plain CSS variables (so they also work from inline
  styles in the white-label preview, which reads `primaryColor` from
  the academy config at runtime). A single source of truth prevents
  drift between "CSS variables for inline styles" and "Tailwind config
  for utilities".
- **Consequences** — Color names surface as both `var(--color-flame)`
  and `bg-flame` / `text-flame` utilities with no extra mapping code.
  Components that need a runtime color (the settings page phone
  preview) use the CSS variable directly. Components with a static
  color use Tailwind utilities.
- **Revisit when** — Tailwind v4's config story changes again, or we
  hit a token we can't express with `@theme`.

---

## 5. Student app (Expo)

### 5.1 expo-router (file-based routing)

- **Decision** — Use expo-router, not React Navigation directly.
- **Rationale** — Same mental model as Next.js (file = route, `(group)`
  = route group, `[param]` = dynamic). One less thing to learn.
  Expo-router is built on top of React Navigation so we keep the
  escape hatch.
- **Revisit when** — Never, unless expo-router breaks stability.

### 5.2 NativeWind, not StyleSheet  [SUPERSEDED — see §5.6]

- **Decision** — Tailwind classes on React Native via NativeWind.
- **Rationale** — Same Tailwind config as the website (minus web-only
  utilities). Component copy-paste between projects *almost* works.
- **Consequences** — NativeWind occasionally lags the latest Tailwind
  features. Acceptable.
- **Superseded** — Never actually installed. When the dashboard was
  built we reached for `StyleSheet.create` first (lower friction for
  the fast iteration loop), and that happened to match the website's
  decision to skip shadcn/ui in favour of hand-rolled primitives
  (§4.8). §5.6 makes that the new official position.

### 5.3 `expo-secure-store` for the JWT, not AsyncStorage

- **Decision** — The JWT is stored in `expo-secure-store`.
- **Rationale** — AsyncStorage is unencrypted disk storage. A
  compromised device would leak the JWT to any other app on that
  device. SecureStore uses the iOS keychain and Android EncryptedStore.
- **Consequences** — One extra native module. Zero effort in Expo.

### 5.4 EAS Update (OTA) for JS-only shipping

- **Decision** — Non-native changes ship via EAS Update on three
  channels: `production`, `staging`, `dev`.
- **Rationale** — Skipping the App Store review for JS fixes turns a
  3-day turnaround into 30 seconds. Critical for a product where a
  broken login screen = angry gym owners on WhatsApp at 6am.

### 5.5 White-label theming via `Query.academyBySlug`

- **Decision** — On launch, the app reads its slug from a deep link
  param or secure storage, calls the public `Query.academyBySlug`, and
  sets CSS variables (or a `useTheme()` context on native) with the
  returned `primaryColor` / `secondaryColor`.
- **Rationale** — The student must see their academy's brand *before*
  logging in. That's why `academyBySlug` is public.
- **Consequences** — An unauthenticated user with an academy slug can
  fetch name/colors/logo. Acceptable — that info is already on the
  academy's public Instagram.

### 5.6 Plain `StyleSheet` + shared `lib/theme.ts` (no NativeWind)

- **Decision** — The student app styles components with
  `StyleSheet.create` and imports a shared `theme` object + `withAlpha`
  helper from `lib/theme.ts`. No Tailwind, no NativeWind, no CSS-in-JS
  library.
- **Context** — The mockups at `mockups/student-dashboard.html` use a
  very specific paper/ink/accent palette with precise shadows,
  rounded-corner ratios, and alpha-blended icon backdrops. Every
  screen ported from the mockups uses the same five or six base
  styles over and over.
- **Rationale** — NativeWind's pitch (copy-pasteable Tailwind classes
  between website and app) evaporates once you realise (a) the website
  ships hand-rolled primitives not shadcn (see §4.8), so there's
  nothing to copy; (b) the dashboard needs runtime accent colors from
  the academy query, which means either passing the color through a
  prop (which works identically with `StyleSheet` via inline style
  arrays) or plumbing it through `className` with a dynamic CSS var
  (more ceremony). Plain `StyleSheet` gives us the RN perf story, the
  smallest bundle, and zero build-time surprises.
- **Consequences** — `lib/theme.ts` is the only place neutral tokens
  live. Components reach for `theme.ink900` directly; the per-academy
  `primaryColor` threads through via `useDashboard()`. If we ever need
  NativeWind later (e.g., sharing one component between website and
  app), the migration is mechanical because every style is already an
  object.
- **Revisit when** — We need to share actual component source between
  `website/` and `app/`, OR we have more than ~15 screens and the
  style definitions start feeling repetitive.

### 5.7 `lucide-react-native` for icons (no emoji)

- **Decision** — All UI icons come from `lucide-react-native`
  (backed by `react-native-svg`). Emoji are never used as icons in
  interactive elements — they remain acceptable only inside
  user-generated content or marketing copy.
- **Context** — The initial dashboard shipped with emoji placeholders
  (`📅`, `💪`, `💳`, `🏋️`, `●` for the bell). On iOS they render as
  Apple's colorful emoji, on Android as Google's, and on web as
  whatever the OS serves — none of which match the paper/ink
  aesthetic, and none of which respect a stroke color or a hover
  state. The bottom nav also looked broken because the "active" state
  was "same emoji at full opacity", which is not a state change a
  user notices.
- **Rationale** — lucide is the same icon family the website uses
  (`lucide-react`), same names, same visual weight. `react-native-svg`
  is a first-class Expo dep — zero native config. The icons inherit
  `color` and `strokeWidth` props, so the per-academy accent flows
  through naturally and the active tab gets a bolder stroke.
- **Consequences** — Every new screen imports named icons from
  `lucide-react-native` (`import { Home, Dumbbell } from
  'lucide-react-native'`). Bundle cost is ~per-icon tree-shaken. No
  icon font, no sprite sheet to maintain.
- **Revisit when** — We need an icon lucide doesn't have and custom
  SVG is faster than asking the design pass upstream.

---

## 6. Visual design system

The visual foundation is defined in `mockups/design-system.css` and applied
across every mockup (except the original two untouched dashboards, which
will be redesigned when they're ported to Next.js/Expo).

### 6.1 Palette: warm paper + ink + flame [SUPERSEDED by §6.1bis]

- **Decision** — Warm paper (`#faf8f5`) background, near-black ink
  (`#0c0a09`) text, flame tangerine (`#e8551c`, desaturated) accent.
  Secondary accent is pine (`#0f766e`, deep teal), used sparingly.
- **Context** — The original mockups used indigo `#6366f1` + violet
  `#8b5cf6` — exactly the "AI purple" that the taste-skill explicitly
  bans.
- **Rationale** — We need an accent color that works on a Brazilian
  gym brand (energetic, warm, physical) without landing on the three
  clichés: neon purple (AI), neon blue (fintech), neon green (crypto).
  Flame tangerine is warm, bold, culturally resonant (Brazil's
  fitness scene is sun-coded), and saturation stays under 80% so it
  doesn't scream.
- **Consequences** — Every component has to be tuned for the paper
  background — pure white cards look dingy next to `#faf8f5`. We use
  `#fff` for card surfaces and accept the micro-contrast.
- **Revisit when** — The brand matures and needs a signature color
  shift. Then we change the flame, not the paper.

### 6.1bis Palette pivot: warm paper + ink + iOS blue (premium)

- **Decision** — Paper stays `#faf8f5`, ink shifts to a cooler slate
  (`#0f172a` primary, `#64748b` muted, `#334155` secondary). Flame
  accent changes from tangerine to iOS blue `#0A84FF`; `--flame-50` and
  `--flame-100` become light blues (`#eff6ff` / `#dbeafe`). `--line`
  becomes `#bfdbfe`. The `pine` / `emerald` tokens also map to the
  same blue to keep emphasis coherent. `rose` stays `#be123c` for
  danger; `amber` shifts to cyan (`#38bdf8`) to match the cool family.
- **Context** — Mockup commits `1b53bf3`, `55c7a9e`, `6ee02e8`,
  `89cf6c1` repainted `landing.html` (and later admin-dashboard /
  student-dashboard) to a "black + iOS blue premium" palette. The
  decision was made in the mockup layer but never propagated to this
  doc or to `website/src/app/globals.css` — so the live site drifted
  out of sync with the mockup for ~7 commits until this was caught.
- **Rationale** — The brand positioning moved from "energetic Brazilian
  gym" to "multi-segment business management platform" (see the
  `copy: make landing clearly multi-segment` / `reposition landing
  page around microsaas message` commits). The warm tangerine read
  as too consumer/fitness; the cool premium blue reads as software,
  which is the actual category we're selling. Blue is normally the
  fintech cliché forbidden by §6.1, but combined with ink-900 as the
  primary CTA color and used only as accent emphasis, it reads as
  Apple-adjacent premium rather than bank-app default.
- **Consequences** — Token *names* stay the same (`flame`, `pine`,
  `emerald`) so existing components don't have to rename props.
  Semantic status colors lose some contrast (paid = blue, overdue =
  red, pending = amber-cyan — only red stays obviously distinct).
  Any page that read well against `#fff7f1` flame-50 must be re-eyed
  against `#eff6ff`.
- **Revisit when** — Repositioning reverses, or a distinct brand
  color survives user research better than iOS blue.

### 6.2 Typography: Outfit (display) + Geist (body) + JetBrains Mono

- **Decision** — Display headlines in Outfit 500-600 weight, body in
  Geist 400-500, monospace numerals in JetBrains Mono.
- **Context** — The original mockups used Inter — banned by the
  taste-skill as AI slop (see §6.5).
- **Rationale** — Outfit has character at big sizes, is available
  free on Google Fonts, and pairs cleanly with Geist. Geist is
  Vercel's body font — clean, designed for interfaces, not overused
  yet in Brazilian SaaS (unlike Inter). JetBrains Mono for numbers is
  the senior-engineer default — R$ amounts look like data, not text.
- **Consequences** — Three fonts to load. We preconnect and preload on
  the landing; total transfer is ~90KB woff2 over the wire.
- **Revisit when** — A non-free display font becomes available that's
  clearly better (unlikely).

### 6.3 No emojis anywhere in markup

- **Decision** — Every glyph in the mockups is an inline SVG symbol.
  No `📅`, no `💰`, no `🔥`. The master icon set lives in
  `mockups/_icons.svg` for reference; each page inlines only the
  symbols it actually uses.
- **Context** — The original mockups leaned heavily on emojis for
  icons (the `🏋️ Gym` brand mark, feature card icons, etc.).
- **Rationale** — Emojis render differently on every platform (iOS
  uses Apple, Android uses Google, old Windows uses Microsoft, Linux
  uses whatever). They can't be styled, their size is unpredictable,
  and they look amateurish in premium UI. SVG icons scale, match the
  text color, render identically everywhere, and cost almost nothing.
- **Consequences** — Each page has ~50 lines of SVG defs at the top.
  We accept the duplication because the alternative (external SVG
  sprite file) breaks `file://` URLs for the mockups.
- **Revisit when** — The mockups move off `file://` and start being
  served over HTTP. Then factor out a single `icons.svg` sprite.

### 6.4 Asymmetric layouts, never 3-equal-card rows

- **Decision** — Features section on the landing is a **bento grid**
  (asymmetric spans). Marketing rows alternate left/right (**zig-zag**).
  Pricing has 3 plans but the middle one is elevated by `translateY(-12px)`
  and styled differently. Hero layouts are always split 60/40 or 50/50,
  never centered.
- **Context** — The taste-skill forbids "3 equal cards horizontally"
  and centered hero with text-over-image — exactly what the original
  landing was.
- **Rationale** — Centered + equal-card layouts signal AI-generated
  content at a glance. Users pattern-match "oh, another ChatGPT
  landing" in under a second. Asymmetry forces the eye to move and
  creates the sense that a human made decisions.
- **Consequences** — The layout code is more complex (CSS Grid with
  fractional units, named rows). Mobile falls back to a single column
  via `@media (max-width: 980px)` on every section.
- **Revisit when** — Never.

### 6.5 Anti-slop patterns — strict list

- **Decision** — The mockups deliberately avoid every "AI tell" that
  the taste-skill lists. The checklist:
  - ❌ Inter font → use Outfit + Geist
  - ❌ Purple gradients → use flame tangerine on warm paper
  - ❌ Centered heroes → use asymmetric 60/40 splits
  - ❌ 3 equal feature cards → use bento grids and zig-zag rows
  - ❌ Oversized H1 "screaming" → control hierarchy with weight and
    color, not just massive font-size
  - ❌ Pure `#000` shadows → tinted `rgba(28, 25, 23, X)` shadows that
    match the paper
  - ❌ Emojis → inline SVG
  - ❌ Placeholder names "John Doe" / "Sarah Chan" → realistic
    Brazilian names (Rafael Vasconcellos, Ana Costa, Beatriz Okamoto)
  - ❌ Round marketing numbers (50%, 99.99%) → organic data (94%
    ocupação, R$ 18.420, 4,8% inadimplência)
  - ❌ Startup slop brand names (Acme, Nexus) → the actual brand is
    "Gym"
  - ❌ Filler words (seamless, elevate, unleash) → concrete verbs
- **Revisit when** — A specific anti-slop rule conflicts with a
  concrete user need. Then override that single rule with a comment
  explaining the exception.

### 6.6 Tinted shadows, never `#000`

- **Decision** — `--shadow-2: 0 1px 3px rgba(28, 25, 23, 0.05), 0 12px
  32px -12px rgba(28, 25, 23, 0.10)` — tinted toward the ink color,
  never pure black.
- **Rationale** — Pure black drop shadows on a warm paper background
  look grimy. Tinted shadows match the tone and feel physical.
- **Revisit when** — Never.

### 6.7 Hardware-accelerated animations only

- **Decision** — Animate `transform` and `opacity`. Never `top`,
  `left`, `width`, `height`.
- **Rationale** — The taste-skill mandates it. Transform and opacity
  run on the compositor thread; the others trigger layout and paint.
- **Revisit when** — Never.

---

## 7. Copy + brand voice

### 7.1 PT-BR throughout, direct tone, no corporate fluff

- **Decision** — All user-facing copy is in Brazilian Portuguese, with
  the directness of a friend explaining something, not a corporate
  brochure. No "soluções completas", no "empodere", no "transforme".
- **Examples** — "A gestão da sua academia, do seu jeito." /
  "A gente prefere lançar uma feature feia que resolve um problema do
  que polir três meses uma feature que ninguém vai usar." /
  "A gente respondeu uma mensagem no Instagram e nunca mais parou de
  conversar com donos de academia."
- **Rationale** — Brazilian gym owners can smell corporate Portuguese
  from a mile away and tune it out. The direct, slightly self-
  deprecating voice positions Gym as "one of us" vs. the enterprise
  vendors they resent.
- **Revisit when** — Data shows it's hurting conversion (it won't).

### 7.2 Realistic Brazilian names for all personas

- **Decision** — Personas on testimonials and examples are named as
  actual Brazilian people: Rafael Vasconcellos, Ana Costa, Beatriz
  Okamoto, Diego Ferraz, Mariana Guedes. Their academies are named
  realistically: CrossFit SP, Studio Vida, PowerLab, FitHaus.
- **Rationale** — "John Doe" / "Jane Smith" placeholders read as
  Silicon Valley stock photos. Brazilian readers clock them as alien.
  Real names + contextual academy names make the mockups feel like
  actual customers. We use the same names consistently across pages
  (João Silva's pending payment in the finance page matches his
  dashboard entry) because small continuity builds trust.

### 7.3 Organic numbers, never round

- **Decision** — `94% de ocupação`, `R$ 18.420`, `4,8% de
  inadimplência`, `240+ academias`, `38k alunos`, `99,97% uptime`.
  Never `95%`, `R$ 20k`, `5%`, `250`, `40k`, `99.99%`.
- **Rationale** — Round numbers are obvious aspirations. Organic
  numbers read as actual telemetry.

---

## 8. SEO strategy

### 8.1 Only the marketing site is indexed

- **Decision** — `landing.html`, `pricing.html`, `features.html`,
  `about.html`, `contact.html` are `index, follow`. Every admin page
  and every student-app screen is `noindex, nofollow`. `robots.txt`
  disallows `/admin/`, `/login`, `/*/dashboard`, and the tab routes.
- **Rationale** — Authenticated pages have no business in Google's
  index — they leak tenant names, waste crawl budget, and confuse
  search intent.

### 8.2 JSON-LD per page type, minimal but correct

- **Decision** — Each public page gets the right Schema.org type:
  - Landing → `Organization` + `SoftwareApplication` (with `offers`)
    + `BreadcrumbList`
  - Pricing → `Product` + `Offer` (one per plan) + `BreadcrumbList` +
    `FAQPage`
  - Features → `WebPage` + `BreadcrumbList`
  - About → `AboutPage` (with `mainEntity: Organization`)
  - Contact → `ContactPage` (with `contactPoint` entries for sales +
    support)
- **Why not HowTo schema** — Deprecated by Google in September 2023.
  The seo skill is explicit: never recommend it.
- **Why FAQ only on pricing** — FAQ schema rich results are now
  limited to government and healthcare sites per Google's 2023 update.
  We include it on pricing anyway because it still helps LLM parsing
  even without rich result eligibility.
- **Consequences** — Every page edit has to remember to update the
  JSON-LD. A linter would be nice.

### 8.3 Sitemap with `hreflang`, even though we're monolingual

- **Decision** — `sitemap.xml` includes `<xhtml:link rel="alternate"
  hreflang="pt-BR">` and `hreflang="x-default"` on every URL.
- **Rationale** — Costs nothing, signals to Google that the canonical
  locale is `pt-BR`, and prepares us for if/when we add Spanish or
  English versions.

### 8.4 Allow AI crawlers explicitly in `robots.txt`

- **Decision** — `robots.txt` has `Allow: /` blocks for GPTBot,
  ChatGPT-User, Google-Extended, PerplexityBot, ClaudeBot, and CCBot.
- **Rationale** — We *want* Gym to show up in ChatGPT / Perplexity /
  Claude answers when someone asks "sistema para gerenciar academia".
  Opting out (the 2023 trend) sacrifices that visibility for nothing.
- **Consequences** — Our content can be used to train models. Since
  the marketing copy is already public anyway, that's an acceptable
  trade.

### 8.5 Block scraper bots (SemrushBot, AhrefsBot)

- **Decision** — SemrushBot and AhrefsBot are explicitly disallowed.
- **Rationale** — They consume crawl budget without driving any
  traffic. Our competitors use them to snapshot our site; we see no
  reciprocal value.

### 8.6 `llms.txt` — markdown summary for LLM web search

- **Decision** — `mockups/llms.txt` mirrors the emerging
  `llms-full.txt` convention: a markdown-formatted summary of what Gym
  is, key pages, product surfaces, differentiators, contact info.
- **Rationale** — LLM web search (Perplexity, ChatGPT) cites
  deterministic text better than JavaScript-rendered HTML. A tight
  markdown file is the highest-signal-per-byte artifact we can ship.
- **Consequences** — It's a duplicate of the landing copy. Keeping
  them in sync is manual today.

### 8.7 Semantic HTML5 and `lang="pt-BR"`

- **Decision** — Every public page uses `<header>`, `<main>`,
  `<article>`, `<section>`, `<nav>`, `<aside>`, `<footer>`. Every
  `<html>` has `lang="pt-BR"`.
- **Rationale** — Accessibility + SEO baseline. Non-negotiable.

---

## 9. Tooling + DX

### 9.1 `dev.sh` tmux launcher

- **Decision** — A single script (`./dev.sh`) detects which of
  `backend/`, `website/`, `app/` are scaffolded and launches each in
  its own pane of a shared `gym` tmux session.
- **Rationale** — Three terminals by hand is fine once. On the 80th
  fresh clone it's friction that accumulates. The script is ~120
  lines and saves that friction forever.
- **Consequences** — Requires tmux. We accept that — it's standard on
  Linux / macOS dev machines.

### 9.2 `create-strapi-app` with `--no-example` flag

- **Decision** — The backend scaffold uses `--no-example` to skip
  Strapi's example content.
- **Rationale** — The example content is a blog — entirely irrelevant
  to our domain and creates noise at setup time.

### 9.3 `dev` script drops Postgres as the hard dep

- **Decision** — The backend runs on PostgreSQL only. No SQLite
  fallback.
- **Context** — Strapi v5 ships SQLite as the default dev database.
- **Rationale** — Multi-tenancy + JSON fields + the relation complexity
  in our schema mean dev/prod parity is a must. SQLite works for 80%
  of queries and silently breaks the remaining 20% (JSON operators,
  case sensitivity, locking). Fail loud in dev, not once in
  production.
- **Consequences** — New contributors need Postgres running locally.
  `dev.sh` notes this in the prerequisites section.

### 9.4 `.env` is gitignored; `.env.example` is canonical

- **Decision** — `backend/.env` is in `.gitignore`. Every non-secret
  default lives in `backend/.env.example`, which is tracked. Same
  pattern for `website/.env.local.example` and `app/.env.example`.
- **Rationale** — Secrets never enter git. The example file is the
  source of truth for "which vars exist" and ships with placeholder
  values that crash loudly if forgotten.

### 9.5 Design decisions are a hard documentation rule

- **Decision** — Every non-obvious technical decision gets an entry in
  this file, in the **same commit** that introduces it. The rule is
  enforced at the project level via [`CLAUDE.md → Working
  conventions`](../CLAUDE.md#working-conventions) and is saved as a
  feedback memory so future Claude sessions apply it automatically.
- **Context** — Over the scaffold + mockup + codegen phase we made
  dozens of non-obvious choices (GraphQL-only, Expo not Next.js,
  `shadowCRUD: false`, flame-tangerine palette, etc.). Each time the
  rationale was captured after the fact. That cost time and risked
  drift — the next session had to re-derive the "why" from git log +
  code.
- **Rationale** — A decision log is worthless if it lags behind the
  code. Putting the doc update in the same commit as the code change
  means:
  - The PR review covers both — reviewers can push back on the *why*,
    not just the *what*.
  - `git blame` on the decision log leads straight to the
    implementing commit.
  - Future sessions (human or Claude) never have to reconstruct
    intent from scratch.
- **Consequences** — Commits are slightly larger (usually ~30-80 more
  lines in `docs/design-decisions.md`). Acceptable.
- **Revisit when** — Never. This rule is load-bearing.

### 9.6 `backend/schema.graphql` regenerated on every schema change

- **Decision** — Every backend schema edit ships with a regenerated
  `backend/schema.graphql` in the same commit. The file is the source
  of truth for frontend codegen.
- **Context** — The website and app both run `@graphql-codegen/cli`
  against `../backend/schema.graphql`. If the SDL diverges from the
  runtime schema, the frontends type-check against stale types and
  fail at runtime.
- **Rationale** — Committing the SDL means:
  - Fresh clones can run `npm run codegen` without booting Strapi.
  - CI type-checks without a running backend.
  - Schema changes show up as line diffs in PRs — API breakage is
    reviewable.
- **Consequences** — When you change a content type or GraphQL type
  module, you have to boot the backend once (or run
  `npx strapi ts:generate-types` against an available Postgres) so
  Nexus re-emits the file. No pre-commit hook enforces this today —
  reviewers catch it.
- **Revisit when** — We get burned by a PR that forgot to regen. Then
  add a husky pre-commit hook that runs the regen and stages the
  diff.

### 9.7 Nexus API: `nonNull` is a function, not a namespace

- **Decision** — In `src/extensions/graphql/types/*.ts`, arg wrappers
  use `nexus.nonNull(nexus.idArg())` and `nexus.nonNull(nexus.arg({
  type: 'X' }))`. Never `nexus.nonNull.idArg()` (that's a namespace
  that doesn't exist in Nexus v1).
- **Context** — The initial schema was written based on muscle memory
  from `t.nonNull.id('field')` (which *is* valid on output types,
  where `nonNull` is a fluent chain off `t`). The same shape does not
  exist on the top-level `nexus` import — `nexus.nonNull` is a
  function that wraps an arg/type.
- **Consequences** — The whole schema builds at boot time. This was
  caught by the first real Strapi boot that got past the Postgres
  auth check. Fixed across all 9 type modules in one pass.
- **Lesson** — When in doubt, run `npm run develop` early. Static
  type checks (`tsc --noEmit`) do **not** catch Nexus API misuse
  because the types are heavily overloaded.

### 9.8 Dockerfiles: BuildKit cache mounts + Next.js standalone output

- **Decision** — `backend/Dockerfile` and `website/Dockerfile` are
  BuildKit-only (`# syntax=docker/dockerfile:1.7`) and use
  `--mount=type=cache` on `/root/.npm` and (for the website) on
  `/app/.next/cache`. The website enables `output: "standalone"` in
  `next.config.ts` so the runtime image ships the traced server bundle
  only — no full `node_modules`, no source.
- **Context** — The goal was "build fast first, then small". Cache
  mounts keep npm downloads and the Next incremental build cache warm
  between rebuilds, which is where the bulk of CI/local rebuild time
  goes. Standalone output is the single largest win for image size
  on Next.js (hundreds of MB → tens of MB).
- **Rationale** — Both optimizations are pure wins for production
  builds, and standalone is the approach Vercel explicitly recommends
  for Docker. The cache mounts are scoped to BuildKit, which has been
  the default builder for years — no portability concern.
- **Consequences** —
  - `docker build` must run under BuildKit (it does by default in
    Docker ≥ 23, and CI runners already honor it).
  - The website's runtime CMD is `node server.js` against the
    standalone bundle, not `npm run start`. `next start` would still
    work if standalone were disabled, but re-introducing it would
    balloon the image.
  - The backend runtime uses the `vips` apk package (runtime libvips
    only), not `vips-dev`. If a future Strapi plugin needs libvips
    headers at runtime, swap them back.
- **Revisit when** — we need to target a non-BuildKit builder, or
  Next.js changes its standalone output layout (the `COPY` of
  `.next/standalone` + `.next/static` + `public` is the contract).

### 9.9 Strapi v5 TypeScript runtime: ship `tsconfig.json`, TS sources, and `typescript` in production

- **Decision** — `backend/Dockerfile`'s runtime stage copies
  `tsconfig.json`, `src/`, `config/`, and `dist/`. `typescript` lives
  in `dependencies` (not `devDependencies`) so `npm ci --omit=dev`
  installs it. Strapi reads configs and schemas from `dist/` in TS
  mode; the root-level `src/` and `config/` copies are *only* there
  to satisfy TypeScript's config parser.
- **Context** — The first production deploy crashed on boot with
  `Cannot destructure property 'client' of 'db.config.connection'`
  preceded by six `Config file not loaded, extension must be one of
  .js,.json): <name>.ts` warnings. Root cause: `strapi start` calls
  `@strapi/typescript-utils → isUsingTypeScript(appDir)` which only
  checks for `tsconfig.json`. Without it, Strapi treats the project
  as plain JS, sets `distDir = appDir`, and the config loader reads
  `/opt/app/config/*.ts` (skipping every file because `.ts` is not
  in `VALID_EXTENSIONS = ['.js', '.json']`).
- **The follow-on trap** — adding `tsconfig.json` alone isn't
  enough. `@strapi/typescript-utils` calls
  `ts.getParsedCommandLineOfConfigFile` on the tsconfig at start
  time, and TypeScript refuses to return a parsed config with
  `errors.length === 0` if the `include` globs match zero files
  (error TS18003 "No inputs were found"). `backend/tsconfig.json`
  excludes `dist/` and includes the root source tree, so if the
  runtime image is "cleaned up" to only ship `dist/`, the parser
  finds zero matches and Strapi exits with code 1. The root-level
  `src/` and `config/` must be present — **even though Strapi
  never reads them** — purely to keep TypeScript happy. They're
  ~550 KB combined, cheaper than maintaining a runtime-specific
  minimal tsconfig with `"files": ["dist/src/index.js"]`.
- **Rationale** — Every requirement here comes from Strapi
  internals we don't control
  (`packages/core/core/src/configuration/index.js` line 56:
  `const configDir = path.resolve(distDir || process.cwd(),
  'config')`). Shipping `tsconfig.json` + the `typescript` package
  + the TS source tree is ~70 MB of overhead but keeps the runtime
  aligned with upstream. The alternative — patching tsconfig at
  build time or hardcoding `distDir` — diverges from Strapi's
  expected layout and would break on the next upgrade.
- **Consequences** —
  - `typescript` is a runtime dependency in `backend/package.json`.
    This differs from the `create-strapi-app` default, which puts
    it in `devDependencies` — that default is wrong for any Docker
    deploy that runs `npm ci --omit=dev`.
  - The runtime image ships the TS source even though it's never
    read at boot. If you're tempted to delete the `COPY src` and
    `COPY config` lines: don't. They exist to feed TypeScript's
    include globs, not Strapi.
  - Schema JSONs Strapi actually uses live at
    `dist/src/api/*/content-types/*/schema.json`, not
    `/opt/app/src/...`. The copies at the root are load-bearing
    only for the `tsconfig.json` parse step.
- **Revisit when** — Strapi v6 changes how `distDir` / `outDir` is
  resolved, `@strapi/typescript-utils` stops `require()`-ing the
  `typescript` package during start, or `ts.getParsedCommandLineOfConfigFile`
  gains an option to skip input-file validation.

### 9.10 `app/` typecheck uses `node --stack-size=8000`

- **Decision** — `app/package.json` exposes a `typecheck` script that
  runs `node --stack-size=8000 node_modules/typescript/lib/tsc.js
  --noEmit` rather than a bare `tsc --noEmit`. Anything measuring the
  app's type health (CI, pre-commit hooks, local verification) calls
  `npm run typecheck`.
- **Context** — After wiring expo-router, `npx tsc --noEmit` started
  crashing with `RangeError: Maximum call stack size exceeded` deep
  inside `checkNonNullExpression` → `getTypeAtFlowCall`. No source
  error — TypeScript's own control-flow analysis was recursing past
  the default V8 stack size while resolving the generic router types
  that expo-router + `@react-navigation/*` pipe through.
- **Rationale** — Doubling the V8 stack is cheap (a handful of MB per
  tsc invocation) and turns the failure into a clean pass. The
  alternative — manually annotating every crossing of the router type
  boundary to break the inference chain — is architectural clutter
  for a pure tooling problem.
- **Consequences** — Never run `npx tsc --noEmit` directly inside
  `app/`. If a new tool invokes tsc without the flag, it will
  spuriously fail until it's taught to call `npm run typecheck`.
- **Revisit when** — expo-router or TypeScript ships a fix that
  makes the recursion bounded, OR a future refactor makes the router
  types shallow enough that default stack space is sufficient.

---

## 10. Rejected options

Explicit no's so we don't re-argue them.

### 10.1 shadowCRUD

- **Rejected** in §3.2. See rationale there.

### 10.2 TanStack Query + REST

- **Rejected** in §3.1 / §4.2. GraphQL + Apollo normalized cache is
  the better fit for this product.

### 10.3 Next.js PWA for the student app

- **Rejected** in §1.2. Expo is correct.

### 10.4 AsyncStorage for JWTs on mobile

- **Rejected** in §5.3. SecureStore only.

### 10.5 AI purple / violet brand palette

- **Rejected** in §6.1. Flame tangerine on warm paper.

### 10.6 Inter font

- **Rejected** in §6.2 / §6.5. Outfit + Geist.

### 10.7 Emoji-as-icons

- **Rejected** in §6.3. Inline SVG only.

### 10.8 Centered heroes with gradient backgrounds

- **Rejected** in §6.4 / §6.5. Asymmetric splits with product previews.

### 10.9 3-equal-card feature rows

- **Rejected** in §6.4. Bento grids and zig-zag rows.

### 10.10 `HowTo` schema

- **Rejected** in §8.2. Deprecated by Google in September 2023.

### 10.11 Blocking AI crawlers in robots.txt

- **Rejected** in §8.4. We want to be cited in LLM answers.

### 10.12 Separate admin project + shared component package on day one

- **Rejected** in §4.3. One project for marketing + admin until the
  duplication actually hurts.

### 10.13 Per-tenant Postgres databases

- **Rejected** in §1.4. Row-level tenant scoping is sufficient.

### 10.14 SQLite for dev

- **Rejected** in §9.3. Postgres only, dev and prod.

---

## Changelog

- **2026-04-08** — Initial version. Captures the scaffold + mockup +
  doc work up to commit `3c9aa07`.
- **2026-04-08** — Added §4.5 (codegen client preset), §4.6 (committed
  SDL), §9.5 (documentation-discipline hard rule), §9.6 (schema regen
  workflow), §9.7 (Nexus API gotcha). Rewrote §4.1 (Next.js 16 + React
  19 + Tailwind v4 — the actual scaffold, not the earlier 14 pin).
  Up to commit `e4b7804` plus the current docs commit.
- **2026-04-08** — Added §9.9 documenting why `backend/Dockerfile` must
  ship `tsconfig.json` and why `typescript` lives in `dependencies`.
  Triggered by a production boot crash (`Cannot destructure property
  'client' of 'db.config.connection'`) caused by Strapi falling back to
  the TS source `config/` when `tsconfig.json` was missing from the
  runtime image.
- **2026-04-08** — Expanded §9.9 after a follow-on TS18003 crash: the
  runtime image also has to keep the `src/` and `config/` TS source
  copies so `ts.getParsedCommandLineOfConfigFile` finds matching
  `include` globs. They are load-bearing for the tsconfig parser
  only; Strapi itself still reads everything from `dist/`.
- **2026-04-08** — Implemented every mockup page in `website/`
  (landing, pricing, features, about, contact, login + admin
  dashboard, students, finance, schedule, settings) using hand-rolled
  UI primitives and Tailwind v4 `@theme` tokens ported from
  `mockups/design-system.css`. Added `sitemap.ts`, `robots.ts`,
  `llms.txt`, and JSON-LD structured data via `src/lib/seo.tsx`.
  Added the demo-mode toggle (§4.7) mirroring the `app/` pattern so a
  fresh clone renders the full UI without Strapi. Added §4.7
  (demo-mode toggle), §4.8 (no shadcn/ui for now), and §4.9 (Tailwind
  v4 `@theme` as token source of truth).
- **2026-04-08** — Migrated `app/` from a single-screen `App.tsx` to a
  proper expo-router tree: `app/_layout.tsx` (Apollo provider +
  safe-area root) and `app/(tabs)/_layout.tsx` with a custom
  `BrandedTabBar` that matches the mockup's paper-background + accent
  dot aesthetic. Ported the dashboard to `(tabs)/index.tsx` and added
  four placeholder screens (`schedule`, `workouts`, `payments`,
  `profile`) sharing a new `components/PlaceholderScreen.tsx`.
  Swapped every emoji icon (`📅`, `💪`, `💳`, `🏋️`, `●`) for
  `lucide-react-native` components — same family as the website's
  `lucide-react`. Marked §5.2 (NativeWind) as SUPERSEDED and added
  §5.6 (plain `StyleSheet` + shared `lib/theme.ts`) and §5.7
  (`lucide-react-native` for icons, no emoji).
