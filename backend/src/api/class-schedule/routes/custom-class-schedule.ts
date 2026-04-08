/**
 * Custom class-schedule routes.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/class-schedules/:id/bookings',
      handler: 'class-schedule.bookings',
      config: {
        auth: true,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
