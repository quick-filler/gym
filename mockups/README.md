# Gym — HTML Mockups

Static HTML prototypes for visual reference and implementation guidance.
No build step, no JavaScript framework — open any file directly in the
browser. Google Fonts is the only external dependency.

## Design system

The new mockups (everything except the original three legacy files) share
a single design system file: **`design-system.css`**. It defines the warm
"paper + ink + flame" palette, the Outfit / Geist / JetBrains Mono type
stack, the icon component, and the shared layout primitives. New pages
link it via `<link rel="stylesheet" href="design-system.css">` and add
their own page-specific styles inline.

The original three mockups (`landing.html`, `admin-dashboard.html`,
`student-dashboard.html`) keep their inline styles for self-contained
reference, but `landing.html` was redesigned to match the new aesthetic
end-to-end (the old indigo/violet "AI slop" palette is gone).

`_icons.svg` is the master icon library — pages inline only the symbols
they actually use, both to keep each file standalone (works on `file://`)
and to avoid pulling in symbols that aren't rendered.

## Pages

### Marketing site (publicly indexable)

| File | Description |
|------|-------------|
| `landing.html` | Landing page — hero, bento features, how-it-works, pricing, testimonials, FAQ, CTA, footer |
| `pricing.html` | Detailed pricing — three plans, comparison table, FAQ, monthly/annual toggle |
| `features.html` | Features deep-dive — alternating zig-zag rows for the 5 product surfaces |
| `about.html` | About page — story, big stats, values, team |
| `contact.html` | Contact page — channels (WhatsApp, email, demo), inline form |
| `login.html` | Admin sign-in — split layout (form left, branded panel right) |

### Admin panel (`noindex`)

| File | Description |
|------|-------------|
| `admin-dashboard.html` | Visão geral — metrics, mini-stats, recent students table |
| `admin-students.html` | Student management — filter chips, status strip, table with row actions |
| `admin-finance.html` | Financeiro — KPI strip, charges table, payment-method breakdown |
| `admin-schedule.html` | Agenda — weekly grid with class blocks, week navigator, side stats |
| `admin-settings.html` | Configurações — identity tab with logo upload, color pickers, white-label preview |

### Student app — white-label phone frames (`noindex`)

| File | Description |
|------|-------------|
| `student-dashboard.html` | Início — next class, quick actions, payment status, current workout |
| `app-schedule.html` | Agenda — day picker, class cards with capacity bars and booking states |
| `app-workouts.html` | Treinos — current ficha, exercises with sets/reps/load, history |
| `app-payments.html` | Finanças — next charge, status banner, history list, payment methods |
| `app-login.html` | Login — branded header, email/password, biometric option |

### SEO infrastructure

| File | Description |
|------|-------------|
| `sitemap.xml` | XML sitemap covering all marketing pages with `lastmod`, priority, and `hreflang` |
| `robots.txt` | Crawl rules — marketing pages allowed, admin/app blocked, AI crawlers explicitly allowed |
| `llms.txt` | Markdown summary for LLM web search (Perplexity, ChatGPT, Claude) |

## Implementation notes

- Use these as the **visual reference** when building the real Next.js
  components in `website/` and the Expo screens in `app/`.
- Every interactive state shown is a static illustration — the real app
  will wire it via Apollo Client against the GraphQL backend.
- The student app uses `--primary: #ef4444` (red) to demonstrate
  white-label theming via CSS variables. In the real Expo build, the
  primary color comes from the `Query.academyBySlug` payload at runtime.

## Mapping to real components

| Mockup section | Target |
|----------------|--------|
| Landing → Hero, Features, Pricing, FAQ | `website/src/components/marketing/*` |
| Admin sidebar, topbar, table, KPIs | `website/src/components/admin/*` |
| Student dashboard, schedule, workouts | `app/components/*` and `app/app/(academy)/(tabs)/*.tsx` |

## Anti-AI-slop checklist

The redesign deliberately follows the project's design conventions:

- ❌ No Inter font — uses **Outfit** (display) + **Geist** (body) + **JetBrains Mono**
- ❌ No AI purple/violet — uses **flame tangerine** (`#e8551c`) on warm paper
- ❌ No emojis in markup — every glyph is an inline SVG
- ❌ No centered hero with gradient — asymmetric grid hero on landing
- ❌ No 3-equal-card feature row — bento grid, zig-zag rows, asymmetric splits
- ✅ Tinted shadows (never pure black)
- ✅ Semantic HTML5 throughout
- ✅ Full SEO meta + JSON-LD on every public page
