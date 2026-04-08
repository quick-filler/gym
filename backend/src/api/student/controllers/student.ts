/**
 * student controller
 *
 * Data surface lives in src/extensions/graphql/types/student.ts — this file
 * only provides the default CRUD so the Strapi admin UI keeps working.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::student.student');
