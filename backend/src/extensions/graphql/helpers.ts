/**
 * Shared helpers for explicit GraphQL resolvers.
 *
 * The schema uses Strapi's documentId as the canonical GraphQL ID and never
 * exposes the numeric primary key. These helpers centralize the boilerplate
 * around fetching, scoping by academy, and shaping responses so each
 * content-type module stays focused on the field definitions.
 */

import type { Core } from '@strapi/strapi';

/**
 * Returns the academyId of the authenticated user, if they are linked to a
 * Student record. Used to scope list queries so an academy_admin only ever
 * sees their own academy's data — and a student only sees their academy.
 *
 * Returns null for unauthenticated requests (which should be blocked by
 * resolversConfig.auth before reaching the resolver) and for super_admin
 * users that aren't linked to a single academy.
 */
export async function resolveUserAcademyId(
  strapi: Core.Strapi,
  ctx: any
): Promise<string | null> {
  const userId = ctx?.state?.user?.id;
  if (!userId) return null;

  const students: any[] = await strapi.documents('api::student.student').findMany({
    filters: { user: { id: userId } },
    populate: { academy: { fields: ['documentId'] } },
    limit: 1,
  });

  return students[0]?.academy?.documentId ?? null;
}

/**
 * Wraps a resolver in academy-scoped filters. If the caller is linked to an
 * academy, every list/findOne is filtered to that academy. Super-admins
 * (no linked Student) bypass the filter and see everything.
 */
export function withAcademyScope(filters: any, academyId: string | null): any {
  if (!academyId) return filters;
  return { ...filters, academy: { documentId: academyId } };
}
