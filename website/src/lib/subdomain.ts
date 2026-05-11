/**
 * Resolve the academy slug for the current page, used to brand the
 * login screen before any JWT exists.
 *
 * Resolution order:
 *   1. ?slug=<slug> query param — escape hatch for dev (no subdomain on
 *      localhost) and for environments where wildcard DNS isn't set up.
 *   2. Hostname subdomain — strips APP_DOMAIN from window.location.hostname.
 *      Examples with APP_DOMAIN=gym.quickfiller.org:
 *        crossfit-sp.gym.quickfiller.org → "crossfit-sp"
 *        gym.quickfiller.org             → null
 *        www.gym.quickfiller.org         → null (www is reserved)
 *
 * Returns null when there's nothing to brand by — login renders its
 * default Gym chrome in that case.
 *
 * Pure function, but reads window — call only from client components or
 * useEffect.
 */

import { APP_DOMAIN } from "./config";

const RESERVED = new Set(["www", "app", "admin", "api", "static", "cdn"]);

export function resolveAcademySlug(): string | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("slug")?.trim();
  if (fromQuery) return fromQuery;

  const host = window.location.hostname;
  if (!APP_DOMAIN || !host.endsWith(APP_DOMAIN)) return null;

  const prefix = host.slice(0, host.length - APP_DOMAIN.length);
  // prefix is "" for the root domain, "crossfit-sp." for a subdomain
  if (!prefix.endsWith(".")) return null;
  const label = prefix.slice(0, -1);
  if (!label || RESERVED.has(label)) return null;
  return label;
}
