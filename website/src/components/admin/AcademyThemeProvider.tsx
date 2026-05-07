/**
 * Reads the logged-in user's academy and applies its branding to the
 * /admin tree as CSS custom properties on <html>. Tailwind v4 utilities
 * pick up the vars automatically, so no markup changes are needed for
 * components to recolor.
 *
 * Phase 1 (this file): two flat vars — --color-primary and
 * --color-secondary. Phase 2 will derive a full shade scale via culori.
 *
 * Falls back to nothing when there's no academy (login pre-auth, mock
 * mode without an academy, or a user not linked to one): the page keeps
 * the default Gym tokens defined in globals.css.
 */

"use client";

import { useEffect, type ReactNode } from "react";
import { useAcademy } from "@/lib/hooks";

const ROOT_VARS = ["--color-primary", "--color-secondary"] as const;

export function AcademyThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useAcademy();
  const primary = data?.primaryColor ?? null;
  const secondary = data?.secondaryColor ?? null;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (primary) root.style.setProperty("--color-primary", primary);
    if (secondary) root.style.setProperty("--color-secondary", secondary);
    if (data?.slug) root.dataset.academy = data.slug;

    return () => {
      // Tear down on unmount/route-change-out so signing out doesn't
      // leave a previous tenant's colors stuck on <html>.
      for (const v of ROOT_VARS) root.style.removeProperty(v);
      delete root.dataset.academy;
    };
  }, [primary, secondary, data?.slug]);

  return <>{children}</>;
}
