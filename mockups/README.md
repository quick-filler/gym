# Gym — HTML Mockups

Static HTML prototypes for visual reference and implementation guidance.
No dependencies — open directly in the browser.

## Pages

| File | Description | Preview |
|------|-------------|---------|
| `landing.html` | Marketing landing page (7 sections, PT-BR) | [Open](https://hel1.your-objectstorage.com/quickfiller-openclaw-backups/gym-mockups/landing.html) |
| `admin-dashboard.html` | Academy admin panel (sidebar, metrics, table) | [Open](https://hel1.your-objectstorage.com/quickfiller-openclaw-backups/gym-mockups/admin-dashboard.html) |
| `student-dashboard.html` | Student-facing app (white-label in red/CrossFit SP) | [Open](https://hel1.your-objectstorage.com/quickfiller-openclaw-backups/gym-mockups/student-dashboard.html) |

## Implementation Notes

- These are **static HTML prototypes** — no framework, no build step
- All CSS is inline (`<style>` tag), no external deps except Google Fonts CDN
- Use these as the **visual reference** when building the real Next.js components
- The student dashboard uses `--primary: #ef4444` (red) to demonstrate white-label theming via CSS variables
- In the real app, `--primary` and `--secondary` are injected dynamically by `WhiteLabelProvider` based on the academy's config

## Mapping to Real Components

| Mockup Section | Next.js Component |
|----------------|-------------------|
| Landing → Hero | `src/components/landing/HeroSection.tsx` |
| Landing → Features | `src/components/landing/FeaturesSection.tsx` |
| Landing → How it Works | `src/components/landing/HowItWorksSection.tsx` |
| Landing → Pricing | `src/components/landing/PricingSection.tsx` |
| Landing → CTA Banner | `src/components/landing/CtaBannerSection.tsx` |
| Admin sidebar | `src/components/admin/AdminSidebar.tsx` |
| Admin metrics | `src/components/admin/MetricsCard.tsx` |
| Admin table | `src/components/admin/StudentTable.tsx` |
| Student header | `src/components/academy/WhiteLabelProvider.tsx` |
| Student dashboard | `src/app/(academy)/[subdomain]/dashboard/page.tsx` |
