import { JWT_STORAGE_KEY } from "./config";

export const SESSION_COOKIE_KEY = "gym_session";
export const ROLE_COOKIE_KEY = "gym_role";

export type UserRole = "platform_admin" | "academy_admin";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setAuthCookies(role: UserRole) {
  const opts = `path=/; SameSite=Lax; max-age=${MAX_AGE}`;
  document.cookie = `${SESSION_COOKIE_KEY}=1; ${opts}`;
  document.cookie = `${ROLE_COOKIE_KEY}=${role}; ${opts}`;
}

export function clearAuthCookies() {
  document.cookie = `${SESSION_COOKIE_KEY}=; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE_KEY}=; path=/; max-age=0`;
}

/**
 * Unified sign-out: clears the JWT, the auth cookies, and performs a
 * **hard** navigation. The hard nav (`window.location.href`) is
 * intentional — `router.push` keeps the in-memory Apollo cache and
 * the React tree alive, which means stale user data could flash on
 * the next screen and the middleware redirect dance can keep
 * bouncing the user back into /admin if a cookie is left behind.
 */
export function logoutAndRedirect(destination: string = "/login") {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(JWT_STORAGE_KEY);
  } catch {
    // ignore — private mode / storage disabled
  }
  clearAuthCookies();
  window.location.href = destination;
}
