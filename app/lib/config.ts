/**
 * Runtime configuration for the student app.
 *
 * Read from `EXPO_PUBLIC_*` env vars which are inlined into the JS
 * bundle at build time. Change them in `.env` (or via EAS secrets for
 * EAS Build) and rebuild.
 */

/**
 * Toggle between the local mock data source and the real Apollo/GraphQL
 * data source.
 *
 * - `'true'`  — use static mocks. The app renders instantly with the
 *               CrossFit SP demo content. No network calls.
 * - `'false'` — use the Apollo Client + the backend GraphQL API. The
 *               app waits for the query to resolve, shows skeleton
 *               placeholders while loading, and shows an error card on
 *               failure. **Never falls back to mocks.**
 *
 * Default: `'true'` during scaffold/demo phase. Flip to `'false'` once
 * the backend is publicly reachable (via a tunnel, a staging host, or
 * production) so Expo Go / TestFlight builds always hit real data.
 */
export const USE_MOCKS: boolean = (
  process.env.EXPO_PUBLIC_USE_MOCKS ?? 'true'
).toLowerCase() === 'true';

/**
 * GraphQL endpoint — must be publicly reachable when `USE_MOCKS` is off.
 * Local `localhost:7777` will not work from a phone; use a tunnel
 * (ngrok, cloudflared) or a deployed staging URL.
 */
export const GRAPHQL_ENDPOINT: string =
  process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:7777/graphql';
