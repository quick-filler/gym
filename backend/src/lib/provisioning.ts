/**
 * User provisioning helpers.
 *
 * Single source of truth for turning an email into a log-in-capable
 * `users-permissions` account. Used by three call sites:
 *
 *   - `lead.ts` → provisions the academy_admin when a lead self-serves
 *     a trial (creates a brand-new account, fails if the email is taken).
 *   - `student.ts → createStudent` → provisions a member's app login when
 *     the academy admin adds a student (links to an existing account if
 *     the email already has one).
 *   - `bulk-import.ts` → same as createStudent, in batch, without firing
 *     a welcome email per row.
 *
 * ## Multi-tenancy note
 *
 * `users-permissions.user.email` is globally unique. If the same person
 * is a student at two academies under the same email, there is exactly
 * **one** login and the `me` query resolves to the first linked Student
 * row. This is the documented 1:1 MVP tradeoff (see
 * APP-INTEGRATION-PLAN.md §5.7). `ensureAuthUser` therefore **links to
 * an existing account** instead of failing — the caller that needs
 * "fail on collision" semantics (academy provisioning) keeps its own
 * pre-check.
 */

import crypto from 'node:crypto';
import type { Core } from '@strapi/strapi';

const USER_UID = 'plugin::users-permissions.user';

/**
 * Resolves the numeric id of the built-in "Authenticated" role. Throws a
 * friendly error if it is missing (only happens on a corrupted install).
 */
export async function getAuthenticatedRoleId(
  strapi: Core.Strapi,
): Promise<number> {
  const roles = await strapi
    .plugin('users-permissions')
    .service('role')
    .find();
  const authRole = roles.find(
    (r: any) => r.type === 'authenticated' || r.name === 'Authenticated',
  );
  if (!authRole) {
    throw new Error('Role Authenticated não encontrada.');
  }
  return authRole.id;
}

/**
 * Builds the website password-reset URL for a given token. Students and
 * academy admins both land on the same `/reset-password` page — it works
 * for any users-permissions account.
 */
export function buildResetUrl(token: string): string {
  const websiteOrigin = process.env.WEBSITE_ORIGIN ?? 'http://localhost:9999';
  return `${websiteOrigin.replace(/\/$/, '')}/reset-password?code=${encodeURIComponent(token)}`;
}

/**
 * Looks up a user by email (case-insensitive). Returns the raw row or
 * null. Exported so callers can implement "fail on collision" policies.
 */
export async function findUserByEmail(
  strapi: Core.Strapi,
  email: string,
): Promise<any | null> {
  const normalized = email.trim().toLowerCase();
  const user = await strapi.db
    .query(USER_UID)
    .findOne({ where: { email: normalized } });
  return user ?? null;
}

/**
 * Creates a brand-new users-permissions account with a throwaway
 * password (the person sets the real one via the reset link), marks it
 * confirmed, and stamps a reset token.
 *
 * Does **not** check for an existing email — the caller is responsible
 * for that (use `findUserByEmail` or `ensureAuthUser`).
 */
export async function createAuthUser(
  strapi: Core.Strapi,
  params: { email: string; username?: string },
): Promise<{ userId: number; resetPasswordToken: string }> {
  const email = params.email.trim().toLowerCase();
  const roleId = await getAuthenticatedRoleId(strapi);

  // Throwaway password — replaced by the user via the reset link.
  const tempPassword = crypto.randomBytes(16).toString('base64url');
  const user: any = await strapi
    .plugin('users-permissions')
    .service('user')
    .add({
      username: params.username ?? email,
      email,
      password: tempPassword,
      provider: 'local',
      role: roleId,
      confirmed: true,
      blocked: false,
    });

  const resetPasswordToken = crypto.randomBytes(64).toString('hex');
  await strapi.db.query(USER_UID).update({
    where: { id: user.id },
    data: { resetPasswordToken },
  });

  return { userId: user.id, resetPasswordToken };
}

/**
 * Ensures an account exists for the given email and returns its id.
 *
 *   - If an account already exists → links to it (`created: false`,
 *     `resetPasswordToken: null` because we never reset a stranger's
 *     password).
 *   - If none exists → creates one (`created: true`) and returns the
 *     reset token so the caller can send a "set your password" email.
 *
 * This is the function the student-facing call sites should use: it
 * gracefully handles the multi-academy edge case (same email, two gyms)
 * by sharing the single login.
 */
export async function ensureAuthUser(
  strapi: Core.Strapi,
  params: { email: string },
): Promise<{ userId: number; created: boolean; resetPasswordToken: string | null }> {
  const existing = await findUserByEmail(strapi, params.email);
  if (existing) {
    return { userId: existing.id, created: false, resetPasswordToken: null };
  }
  const { userId, resetPasswordToken } = await createAuthUser(strapi, {
    email: params.email,
  });
  return { userId, created: true, resetPasswordToken };
}
