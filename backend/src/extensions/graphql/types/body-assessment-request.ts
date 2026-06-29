/**
 * GraphQL for BodyAssessmentRequest (Fase 5b / item 7).
 *
 * A student asks the academy to run a body assessment. Creating one notifies
 * the academy admins (in-app + push); it's auto-resolved to `done` when an
 * admin creates a BodyAssessment for that student (see body-assessment.ts).
 *
 *   - Mutation.requestBodyAssessment(notes)  → student; idempotent (reuses an
 *     open request instead of stacking duplicates).
 *   - Query.myAssessmentRequests(limit)      → the caller's own requests.
 *   - Query.assessmentRequests(status)       → academy queue (staff only).
 */

import type { Core } from '@strapi/strapi';
import { requireRole, resolveUserAcademyId } from '../helpers';
import { notifyAcademyAdmins } from '../../../services/notify';

const UID = 'api::body-assessment-request.body-assessment-request';
const STUDENT = 'api::student.student';

async function resolveCaller(strapi: Core.Strapi, ctx: any) {
  const userId = ctx?.state?.user?.id;
  if (!userId) return null;
  const rows: any[] = await strapi.db.query(STUDENT).findMany({
    where: { user: { id: userId } },
    select: ['id', 'documentId', 'name'],
    populate: { academy: { select: ['id', 'documentId'] } },
    limit: 1,
  });
  const s = rows[0];
  if (!s) return null;
  return {
    id: s.id,
    documentId: s.documentId,
    name: s.name as string,
    academyId: s.academy?.id ?? null,
    academyDocId: s.academy?.documentId ?? null,
  };
}

export function buildBodyAssessmentRequest({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const BodyAssessmentRequest = nexus.objectType({
    name: 'BodyAssessmentRequest',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.string('notes');
      t.nonNull.string('status');
      t.string('createdAt');
      t.field('student', {
        type: 'Student',
        resolve: async (parent: any) => {
          if (parent.student !== undefined) return parent.student;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { student: true },
          });
          return doc?.student ?? null;
        },
      });
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('myAssessmentRequests', {
        type: 'BodyAssessmentRequest',
        description: "The caller's own assessment requests, newest first.",
        args: { limit: nexus.intArg() },
        resolve: async (_root: any, args: any, ctx: any) => {
          const me = await resolveCaller(strapi, ctx);
          if (!me) return [];
          return await strapi.documents(UID).findMany({
            filters: { student: { documentId: me.documentId } } as any,
            sort: { createdAt: 'desc' },
            limit: Math.min(50, Math.max(1, args.limit ?? 10)),
          });
        },
      });

      t.list.field('assessmentRequests', {
        type: 'BodyAssessmentRequest',
        description:
          "The academy's assessment requests (staff only). Defaults to pending.",
        args: { status: nexus.stringArg() },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);
          const academyId = await resolveUserAcademyId(strapi, ctx);
          if (!academyId) return [];
          const status = args.status ?? 'pending';
          return await strapi.documents(UID).findMany({
            filters: { academy: { documentId: academyId }, status } as any,
            populate: { student: { fields: ['documentId', 'name'] } } as any,
            sort: { createdAt: 'desc' },
            limit: 100,
          });
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('requestBodyAssessment', {
        type: 'BodyAssessmentRequest',
        description:
          'Student asks for a body assessment. Idempotent — returns the open request if one already exists. Notifies the academy admins.',
        args: { notes: nexus.stringArg() },
        resolve: async (_root: any, args: any, ctx: any) => {
          const me = await resolveCaller(strapi, ctx);
          if (!me) throw new Error('Sua conta não está vinculada a um aluno.');

          const open: any[] = await strapi.documents(UID).findMany({
            filters: { student: { documentId: me.documentId }, status: 'pending' } as any,
            limit: 1,
          });
          if (open[0]) return open[0];

          const row = await strapi.documents(UID).create({
            data: {
              student: me.documentId,
              academy: me.academyDocId,
              notes: args.notes || null,
              status: 'pending',
            } as any,
          });

          await notifyAcademyAdmins(strapi, me.academyId, {
            kind: 'admin_assessment_request',
            title: 'Solicitação de avaliação física',
            body: `${me.name} pediu uma avaliação física`,
            data: { route: '/admin/workouts' },
          });

          return row;
        },
      });
    },
  });

  return {
    types: [BodyAssessmentRequest, queries, mutations],
    resolversConfig: {
      'Query.myAssessmentRequests': { auth: true },
      'Query.assessmentRequests': { auth: true },
      'Mutation.requestBodyAssessment': { auth: true },
    },
  };
}
