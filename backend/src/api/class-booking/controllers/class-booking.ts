/**
 * class-booking controller
 *
 * Data surface lives in src/extensions/graphql/types/class-booking.ts —
 * including the checkInBooking mutation.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::class-booking.class-booking');
