/**
 * Reads the logged-in user's academy and applies its branding to the
 * /admin tree by overriding the project's design-system tokens at the
 * <html> level. Tailwind v4 utilities (text-flame, bg-flame-50,
 * text-pine, etc.) read those CSS vars, so every component in /admin
 * recolors automatically with no markup change.
 *
 * Tokens we override (defined in src/app/globals.css):
 *   --color-flame, --color-flame-dark, --color-flame-50, --color-flame-100
 *   --color-pine, --color-pine-50
 *
 * The dark/50/100 shades are derived from the base hex via culori, so
 * the academy admin only picks 2 colors and we maintain a coherent set.
 *
 * Also swaps the document favicon to the academy's logo when one is
 * configured, so the browser tab matches the brand. We tag the injected
 * <link> with a data attribute so cleanup doesn't accidentally remove
 * the static favicon shipped by Next.js.
 *
 * Cleanup on unmount removes the inline overrides — Tailwind falls
 * back to the compiled defaults, which means signing out (or hot
 * reloading the layout) doesn't leave a previous tenant's colors
 * stuck on <html>.
 */

"use client";

import { useEffect, type ReactNode } from "react";
import { useAcademy } from "@/lib/hooks";
import { derivePalette, deriveSecondaryPalette } from "@/lib/theme";

const OVERRIDDEN_VARS = [
  "--color-flame",
  "--color-flame-dark",
  "--color-flame-50",
  "--color-flame-100",
  "--color-pine",
  "--color-pine-50",
] as const;

const FAVICON_MARKER = "data-academy-favicon";

function applyAcademyFavicon(href: string | null) {
  if (typeof document === "undefined") return;
  const head = document.head;
  const existing = head.querySelector(
    `link[${FAVICON_MARKER}]`,
  ) as HTMLLinkElement | null;

  if (!href) {
    existing?.remove();
    return;
  }

  if (existing) {
    if (existing.href !== href) existing.href = href;
    return;
  }

  const link = document.createElement("link");
  link.rel = "icon";
  link.href = href;
  link.setAttribute(FAVICON_MARKER, "true");
  head.appendChild(link);
}

export function AcademyThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useAcademy();
  const primary = data?.primaryColor ?? null;
  const secondary = data?.secondaryColor ?? null;
  const slug = data?.slug ?? null;
  const logoUrl = data?.logoUrl ?? null;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    if (primary) {
      const p = derivePalette(primary);
      root.style.setProperty("--color-flame", p.base);
      root.style.setProperty("--color-flame-dark", p.dark);
      root.style.setProperty("--color-flame-50", p.l50);
      root.style.setProperty("--color-flame-100", p.l100);
    }
    if (secondary) {
      const s = deriveSecondaryPalette(secondary);
      root.style.setProperty("--color-pine", s.base);
      root.style.setProperty("--color-pine-50", s.l50);
    }
    if (slug) root.dataset.academy = slug;
    applyAcademyFavicon(logoUrl);

    return () => {
      for (const v of OVERRIDDEN_VARS) root.style.removeProperty(v);
      delete root.dataset.academy;
      applyAcademyFavicon(null);
    };
  }, [primary, secondary, slug, logoUrl]);

  return <>{children}</>;
}
