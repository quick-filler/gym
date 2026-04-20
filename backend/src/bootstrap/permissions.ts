/**
 * Bootstrap helper — sets up the gym-specific roles in users-permissions.
 *
 * Roles created/maintained:
 *   - Authenticated (default — kept as-is, used as fallback)
 *   - Public (default — granted access to the Asaas webhook endpoint)
 *   - academy_admin — full CRUD on their academy's data (via REST/Strapi admin)
 *   - instructor    — read students, manage schedules, write assessments
 *   - student       — read own data, book classes, view own workouts
 *
 * Note on GraphQL: authorization for the /graphql surface is enforced by
 * the per-resolver `resolversConfig.auth` entries in src/extensions/graphql,
 * NOT by these users-permissions actions. The actions below only gate the
 * REST CRUD that the Strapi admin UI uses internally.
 *
 * The setup is idempotent: it checks for existing roles before creating.
 */

import type { Core } from '@strapi/strapi';

const ROLE_BLUEPRINT = [
  {
    name: 'academy_admin',
    description: 'Full CRUD on their own academy\'s data',
    permissions: {
      'api::academy.academy': ['find', 'findOne', 'update'],
      'api::student.student': ['find', 'findOne', 'create', 'update', 'delete'],
      'api::plan.plan': ['find', 'findOne', 'create', 'update', 'delete'],
      'api::enrollment.enrollment': ['find', 'findOne', 'create', 'update', 'delete'],
      'api::class-schedule.class-schedule': ['find', 'findOne', 'create', 'update', 'delete'],
      'api::class-booking.class-booking': ['find', 'findOne', 'create', 'update', 'delete'],
      'api::payment.payment': ['find', 'findOne', 'create', 'update'],
      'api::workout-plan.workout-plan': ['find', 'findOne', 'create', 'update', 'delete'],
      'api::body-assessment.body-assessment': ['find', 'findOne', 'create', 'update', 'delete'],
      'api::expense.expense': ['find', 'findOne', 'create', 'update', 'delete'],
      'api::dependent.dependent': ['find', 'findOne', 'create', 'update', 'delete'],
    },
  },
  {
    name: 'instructor',
    description: 'Manages schedules, writes assessments and workouts',
    permissions: {
      'api::student.student': ['find', 'findOne'],
      'api::class-schedule.class-schedule': ['find', 'findOne', 'create', 'update'],
      'api::class-booking.class-booking': ['find', 'findOne', 'update'],
      'api::workout-plan.workout-plan': ['find', 'findOne', 'create', 'update'],
      'api::body-assessment.body-assessment': ['find', 'findOne', 'create', 'update'],
      'api::dependent.dependent': ['find', 'findOne'],
    },
  },
  {
    name: 'student',
    description: 'Can view own data, book classes, view own workouts',
    permissions: {
      'api::academy.academy': ['findOne'],
      'api::student.student': ['findOne'],
      'api::class-schedule.class-schedule': ['find', 'findOne'],
      'api::class-booking.class-booking': ['find', 'findOne', 'create', 'update'],
      'api::workout-plan.workout-plan': ['find', 'findOne'],
      'api::body-assessment.body-assessment': ['find', 'findOne'],
      'api::plan.plan': ['find', 'findOne'],
      'api::enrollment.enrollment': ['find', 'findOne'],
      'api::payment.payment': ['find', 'findOne'],
      'api::dependent.dependent': ['find', 'findOne', 'create', 'update'],
    },
  },
];

// Only the Asaas webhook is public — it's called by the external payment
// gateway with a shared secret header. Everything else requires auth.
const PUBLIC_PERMISSIONS = {
  'api::payment.payment': ['webhook'],
};

export async function setupRolesAndPermissions(strapi: Core.Strapi) {
  const roleService = strapi.plugin('users-permissions').service('role');

  const existingRoles = await roleService.find();
  const byName = new Map(existingRoles.map((r: any) => [r.name, r]));

  // Ensure custom roles exist.
  for (const blueprint of ROLE_BLUEPRINT) {
    if (byName.has(blueprint.name)) {
      strapi.log.info(`[bootstrap] role "${blueprint.name}" already exists`);
      continue;
    }
    await roleService.createRole({
      name: blueprint.name,
      description: blueprint.description,
      permissions: buildPermissionsObject(blueprint.permissions),
      users: [],
    });
    strapi.log.info(`[bootstrap] created role "${blueprint.name}"`);
  }

  // Ensure public role has the always-public endpoints enabled.
  await ensurePermissions(strapi, 'public', PUBLIC_PERMISSIONS);
}

function buildPermissionsObject(perms: Record<string, string[]>): any {
  const result: any = {};
  for (const [controller, actions] of Object.entries(perms)) {
    result[controller] = {
      controllers: {
        [controller.split('.').pop()!]: Object.fromEntries(
          actions.map((a) => [a, { enabled: true, policy: '' }])
        ),
      },
    };
  }
  return result;
}

/**
 * Idempotently enables a set of action permissions on the given role
 * (looking up by name). Used for the public role since it already exists
 * by default and we just want to flip a few flags on it.
 */
async function ensurePermissions(
  strapi: Core.Strapi,
  roleName: string,
  perms: Record<string, string[]>
) {
  const roles = await strapi.plugin('users-permissions').service('role').find();
  const role = roles.find((r: any) => r.type === roleName || r.name.toLowerCase() === roleName);
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
