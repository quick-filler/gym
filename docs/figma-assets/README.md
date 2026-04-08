# Figma review assets

18 full-page PNG captures of every gym project view, ready to drop into
a Figma file for asynchronous design review.

> **Route C from the Figma setup options.** These are reference images,
> not editable layers — dragging them into Figma gives you a gallery
> wall you can comment on, not a design system you can extend. If you
> want editable components, typography, and Auto Layout, use Route A
> (the Figma plugin) instead. See the chat history for why.

## Contents

| # | File | What it shows |
|---|------|---|
| 01 | `01-landing.png` | Marketing landing (hero, bento, pricing, FAQ, CTA) |
| 02 | `02-pricing.png` | Pricing page — 3 plans + comparison table |
| 03 | `03-features.png` | Features deep-dive — alternating zig-zag rows |
| 04 | `04-about.png` | About — story, stats, values, team |
| 05 | `05-contact.png` | Contact — channels + form |
| 06 | `06-login.png` | Admin login (split layout) |
| 07 | `07-admin-dashboard.png` | Admin Visão Geral — metrics + mini stats |
| 08 | `08-admin-students.png` | Admin student management |
| 09 | `09-admin-finance.png` | Admin financeiro — KPIs + charges table |
| 10 | `10-admin-schedule.png` | Admin agenda — weekly grid |
| 11 | `11-admin-settings.png` | Admin settings — white-label config |
| 12 | `12-student-dashboard.png` | Student app home (phone frame, red theme) |
| 13 | `13-app-schedule.png` | Student app agenda |
| 14 | `14-app-workouts.png` | Student app treinos |
| 15 | `15-app-payments.png` | Student app finanças |
| 16 | `16-app-login.png` | Student app login (white-labeled) |
| 17 | `17-website-next-scaffold-default.png` | **Default Next.js scaffold** — not representative of our design. Included only so the set is complete; the real website is represented by rows 01–06. |
| 18 | `18-app-expo-web.png` | The Expo app running as a static web build — this is what users see when they open Expo Go today. |

All mockups were captured at **1440 × (full scrollable height)**,
fonts pre-loaded (Outfit / Geist / JetBrains Mono), via Playwright +
headless Chromium. Originals are 786 KB – 1.4 MB each, PNG 24-bit.
Total folder size ~6 MB.

## How to import into Figma (2-minute route)

1. Open the Figma desktop app (or web).
2. Create a new file: **File → New design file** (or press `Cmd/Ctrl-N`).
3. In Finder / Explorer, navigate to this folder
   (`gym/docs/figma-assets/`).
4. Select all 18 PNGs (`Cmd/Ctrl-A`), drag them onto the Figma canvas.
5. Figma auto-creates one image node per file. They'll stack on top of
   each other at the drop point — use the Tidy-Up command
   (`Shift-A` with everything selected) to arrange them in a grid.
6. Optionally group each row (marketing / admin / app) into a Section.
7. Review with comments (`C`).

Nothing needs to be uploaded anywhere. The PNGs are local to the repo
and local to the drop target Figma file.

## How to regenerate

The capture script lives at `/tmp/capture-all.py` in the dev session
where these were produced. To re-run:

```bash
# 1. Make sure the dev servers are up
cd website && npm run dev &
cd app && npx expo export --platform web && npx serve dist -l 3001 &

# 2. Run the capture script (uses Playwright + the cached Chromium)
python3 /tmp/capture-all.py
```

The script iterates the mockup HTML files in narrative order, waits
1.8 s per page for fonts + animations to settle, and writes full-page
PNGs to `/tmp/gym-shots/`.

## Limitations to know before you review

- **The Next.js website is the default scaffold** (row 17). The real
  marketing site is the mockups in rows 01–06; porting them to React
  components is the next step. Don't review row 17 as "our design".
- **The Expo app only has the home screen** (row 18). Rows 12–16 are
  HTML mockups of the other app screens. The real React Native
  components for schedule/workouts/payments/login/profile are next up.
- Admin rows (07–11) are HTML mockups. Nothing is implemented in the
  real admin panel yet.
- All status numbers are organic mock data (`R$ 18.420`, `248 alunos`,
  `94% ocupação`, etc.) — not real telemetry.
- Phone-frame rows are captured inside a browser viewport with the
  phone chrome drawn in CSS. The actual Expo rendering (row 18) is
  what a user actually sees in Expo Go.

See `docs/design-decisions.md` for the *why* behind every visual
choice (palette, typography, anti-slop rules, SEO, etc.).
