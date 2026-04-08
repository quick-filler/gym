/**
 * class-schedule controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::class-schedule.class-schedule', ({ strapi }) => ({
  /**
   * Returns all bookings for a given schedule, optionally filtered by date.
   * GET /class-schedules/:id/bookings?date=2026-04-08
   */
  async bookings(ctx) {
    const { id } = ctx.params;
    const { date } = ctx.query;

    const filters: any = { classSchedule: { documentId: id } };
    if (date) filters.date = date;

    const bookings = await strapi.documents('api::class-booking.class-booking').findMany({
      filters,
      populate: {
        student: { fields: ['name', 'email'], populate: { photo: { fields: ['url'] } } },
      },
      sort: { date: 'asc' },
    });

    return { data: bookings };
  },
}));
