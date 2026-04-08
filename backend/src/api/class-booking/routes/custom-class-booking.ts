/**
 * Custom class-booking routes.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/class-bookings/:id/check-in',
      handler: 'class-booking.checkIn',
      config: {
        auth: true,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
