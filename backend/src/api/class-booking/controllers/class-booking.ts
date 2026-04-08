/**
 * class-booking controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::class-booking.class-booking', ({ strapi }) => ({
  /**
   * Mark a booking as attended (check-in).
   * POST /class-bookings/:id/check-in
   */
  async checkIn(ctx) {
    const { id } = ctx.params;

    const booking: any = await strapi.documents('api::class-booking.class-booking').findOne({
      documentId: id,
    });

    if (!booking) return ctx.notFound('Booking not found');
    if (booking.status === 'attended') {
      return { data: booking, message: 'Already checked in' };
    }

    const updated = await strapi.documents('api::class-booking.class-booking').update({
      documentId: id,
      data: {
        status: 'attended',
        checkedInAt: new Date().toISOString(),
      },
    });

    return { data: updated };
  },
}));
