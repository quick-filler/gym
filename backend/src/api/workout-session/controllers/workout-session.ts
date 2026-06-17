/**
 * workout-session controller
 *
 * Data surface lives in src/extensions/graphql/types/workout-session.ts —
 * the student start/finish/cancel mutations + history & stats queries.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::workout-session.workout-session');
