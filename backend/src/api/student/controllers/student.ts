/**
 * student controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::student.student', ({ strapi }) => ({
  /**
   * Returns the authenticated user's linked Student profile (full detail).
   * Used by the student-facing app to load the dashboard.
   */
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const results = await strapi.documents('api::student.student').findMany({
      filters: { user: { id: user.id } },
      populate: {
        photo: { fields: ['url'] },
        academy: {
          fields: ['name', 'slug', 'primaryColor', 'secondaryColor'],
          populate: { logo: { fields: ['url'] } },
        },
        enrollments: {
          populate: {
            plan: { fields: ['name', 'price', 'billingCycle'] },
          },
        },
        workoutPlans: {
          filters: { isActive: true },
          populate: { student: false },
        },
      },
      limit: 1,
    });

    if (!results || results.length === 0) {
      return ctx.notFound('Student profile not found');
    }

    return { data: results[0] };
  },

  /**
   * Override find to scope by authenticated user's academy.
   * Academy admins only see their own students.
   */
  async find(ctx) {
    const user = ctx.state.user;
    const academyId = user?.academy?.id ?? user?.academyId;

    if (academyId) {
      ctx.query.filters = {
        ...((ctx.query.filters as object) || {}),
        academy: { id: academyId },
      };
    }
    return await super.find(ctx);
  },
}));
