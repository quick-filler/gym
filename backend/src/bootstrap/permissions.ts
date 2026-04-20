/**
 * Bootstrap helper — minimal users-permissions wiring.
 *
 * We intentionally do NOT create gym-specific roles
 * (academy_admin / instructor / member) in the users-permissions
 * plugin. Gym roles live on the `Student` content type in a
 * dedicated `role` enum field. This keeps the users-permissions role
 * picker in the admin UI clean — only the default `Public` and
 * `Authenticated` roles plus anything an operator adds on purpose.
 *
 * GraphQL authorization runs off `ctx.state.user.id` → look up the
 * linked Student → check `Student.role` as needed. See the aggregate
 * resolvers + `resolveUserAcademyId` in src/extensions/graphql.
 *
 * This helper only ensures the Public role has the Asaas webhook
 * unblocked; everything else defaults off.
 */

import type { Core } from '@strapi/strapi';

// Only the Asaas webhook is public — it's called by the external payment
// gateway with a shared secret header. Everything else requires auth.
const PUBLIC_PERMISSIONS: Record<string, string[]> = {
  'api::payment.payment': ['webhook'],
};

// Names of the legacy gym roles that used to live in users-permissions.
// Kept here so existing deployments get cleaned up automatically; once
// every environment has rolled through this boot once, this list can be
// emptied and cleanupLegacyRoles removed.
const LEGACY_GYM_ROLES = ['academy_admin', 'instructor', 'student'];

export async function setupRolesAndPermissions(strapi: Core.Strapi) {
  await ensurePermissions(strapi, 'public', PUBLIC_PERMISSIONS);
  await cleanupLegacyRoles(strapi);
}

/**
 * Removes the legacy academy_admin / instructor / student roles that
 * were previously created by this file. Gym-specific access control
 * now lives on `Student.role`, so these roles just clutter the admin
 * UI's role picker.
 *
 * Any user still holding one of these roles is moved back to the
 * default `Authenticated` role before the role is deleted, so the
 * user itself is never destroyed.
 */
async function cleanupLegacyRoles(strapi: Core.Strapi) {
  const roleService = strapi.plugin('users-permissions').service('role');
  const allRoles: any[] = await roleService.find();
  const authRole = allRoles.find(
    (r) => r.type === 'authenticated' || r.name === 'Authenticated',
  );
  if (!authRole) return;

  for (const legacyName of LEGACY_GYM_ROLES) {
    const role = allRoles.find((r) => r.name === legacyName);
    if (!role) continue;

    const users: any[] = await strapi.db
      .query('plugin::users-permissions.user')
      .findMany({ where: { role: role.id } });
    for (const u of users) {
      await strapi.db
        .query('plugin::users-permissions.user')
        .update({ where: { id: u.id }, data: { role: authRole.id } });
    }
    await roleService.deleteRole(role.id);
    strapi.log.info(
      `[bootstrap] removed legacy role "${legacyName}" (${users.length} user(s) → Authenticated)`,
    );
  }
}

/**
 * Idempotently enables a set of action permissions on the given role
 * (looking up by type). Used for the public role so we can expose the
 * Asaas webhook without manual clicks on every fresh install.
 */
async function ensurePermissions(
  strapi: Core.Strapi,
  roleName: string,
  perms: Record<string, string[]>,
) {
  const roles = await strapi.plugin('users-permissions').service('role').find();
  const role = roles.find(
    (r: any) => r.type === roleName || r.name.toLowerCase() === roleName,
  );
  if (!role) {
    strapi.log.warn(`[bootstrap] could not find role "${roleName}"`);
    return;
  }

  for (const [uid, actions] of Object.entries(perms)) {
    for (const action of actions) {
      const actionId = `${uid}.${action}`;
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: actionId, role: role.id } });

      if (existing) {
        if (!existing.enabled) {
          await strapi.db
            .query('plugin::users-permissions.permission')
            .update({ where: { id: existing.id }, data: { enabled: true } });
        }
      } else {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { action: actionId, enabled: true, role: role.id },
        });
      }
    }
  }
  strapi.log.info(`[bootstrap] permissions for "${roleName}" ensured`);
}
