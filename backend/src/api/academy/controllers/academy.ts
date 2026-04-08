/**
 * academy controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::academy.academy', ({ strapi }) => ({
  /**
   * Public endpoint — returns the branding config for a given academy slug.
   * Used by the frontend (website + student app) to theme the page based on
   * the subdomain. Never exposes private fields (admin email, Asaas keys, etc.).
   */
  async findBySlug(ctx) {
    const { slug } = ctx.params;

    const results = await strapi.documents('api::academy.academy').findMany({
      filters: { slug, isActive: true },
      fields: ['name', 'slug', 'primaryColor', 'secondaryColor', 'plan'],
      populate: { logo: { fields: ['url', 'alternativeText', 'width', 'height'] } },
      limit: 1,
    });

    if (!results || results.length === 0) {
      return ctx.notFound('Academy not found');
    }

    return { data: results[0] };
  },
}));
