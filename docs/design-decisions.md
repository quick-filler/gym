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

---

## 5. Student app (Expo)

### 5.1 expo-router (file-based routing)

- **Decision** — Use expo-router, not React Navigation directly.
- **Rationale** — Same mental model as Next.js (file = route, `(group)`
  = route group, `[param]` = dynamic). One less thing to learn.
  Expo-router is built on top of React Navigation so we keep the
  escape hatch.
- **Revisit when** — Never, unless expo-router breaks stability.

### 5.2 NativeWind, not StyleSheet

- **Decision** — Tailwind classes on React Native via NativeWind.
- **Rationale** — Same Tailwind config as the website (minus web-only
  utilities). Component copy-paste between projects *almost* works.
- **Consequences** — NativeWind occasionally lags the latest Tailwind
  features. Acceptable.

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

---

## 6. Visual design system

The visual foundation is defined in `mockups/design-system.css` and applied
across every mockup (except the original two untouched dashboards, which
will be redesigned when they're ported to Next.js/Expo).

### 6.1 Palette: warm paper + ink + flame

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
