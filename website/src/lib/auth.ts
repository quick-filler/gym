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
