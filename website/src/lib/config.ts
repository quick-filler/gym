/**
 * Build-time config — mirrors app/lib/config.ts so the same mock-vs-API
 * toggle pattern works on the website.
 *
 * Defaults to **live mode** — the website expects a running Strapi
 * backend at `NEXT_PUBLIC_GRAPHQL_ENDPOINT`. Flip
 * `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local` (and restart the dev
 * server) to render from `src/lib/mock-data.ts` instead, useful for
 * UI work on a fresh clone or for offline demos.
 */

export const USE_MOCKS: boolean =
  (process.env.NEXT_PUBLIC_USE_MOCKS ?? "false").toLowerCase() === "true";

export const GRAPHQL_ENDPOINT: string =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "http://localhost:7777/graphql";

export const SITE_ORIGIN: string =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:9999";

export const APP_DOMAIN: string =
  process.env.NEXT_PUBLIC_APP_DOMAIN ?? "gym.app";
