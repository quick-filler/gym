/**
 * Build-time config — mirrors app/lib/config.ts so the same mock-vs-API
 * toggle pattern works on the website.
 *
 * Flip `NEXT_PUBLIC_USE_MOCKS=false` in `.env.local` (and restart the dev
 * server) to hit the real Strapi GraphQL API. Defaults to `true` so a
 * fresh clone renders the full UI without a running backend.
 */

export const USE_MOCKS: boolean =
  (process.env.NEXT_PUBLIC_USE_MOCKS ?? "true").toLowerCase() === "true";

export const GRAPHQL_ENDPOINT: string =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "http://localhost:7777/graphql";

export const SITE_ORIGIN: string =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:9999";

export const APP_DOMAIN: string =
  process.env.NEXT_PUBLIC_APP_DOMAIN ?? "gym.app";
