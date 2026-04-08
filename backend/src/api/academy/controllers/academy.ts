/**
 * academy controller
 *
 * The gym API exposes its data surface over GraphQL only — see
 * src/extensions/graphql/types/academy.ts for queries/mutations. This
 * controller only keeps the default core CRUD so Strapi's admin UI still
 * functions.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::academy.academy');
