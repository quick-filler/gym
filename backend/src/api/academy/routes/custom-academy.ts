/**
 * Custom academy routes.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/academies/by-slug/:slug',
      handler: 'academy.findBySlug',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
