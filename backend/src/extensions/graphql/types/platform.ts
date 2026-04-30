/**
 * Platform admin aggregate queries.
 *
 * All resolvers require isPlatformAdmin — they operate across every academy
 * and must never be exposed to regular users.
 *
 * Queries:
 *   platformDashboard  — KPIs: academies, students, MRR, leads
 *   allAcademies(page) — paginated academy list with student count
 */

import { isPlatformAdmin } from '../helpers';
import { BRL } from '../aggregate-helpers';

export function buildPlatform({ nexus, strapi }: any) {
  const ACADEMY = 'api::academy.academy';
  const STUDENT = 'api::student.student';
  const PAYMENT = 'api::payment.payment';
  const LEAD = 'api::lead.lead';

  // ── types ─────────────────────────────────────────────────────────────────

  const PlatformDashboard = nexus.objectType({
    name: 'PlatformDashboard',
    definition(t: any) {
      t.nonNull.int('totalAcademies');
      t.nonNull.int('activeAcademies');
      t.nonNull.int('totalStudents');
      t.nonNull.string('mrr');
      t.nonNull.int('openLeads');
      t.nonNull.int('leadsThisMonth');
    },
  });

  const PlatformAcademy = nexus.objectType({
    name: 'PlatformAcademy',
    definition(t: any) {
      t.nonNull.string('documentId');
      t.nonNull.string('name');
      t.nonNull.string('slug');
      t.nonNull.string('plan');
      t.nonNull.boolean('isActive');
      t.string('email');
      t.nonNull.int('studentCount');
      t.string('createdAt');
    },
  });

  const PlatformAcademyList = nexus.objectType({
    name: 'PlatformAcademyList',
    definition(t: any) {
      t.nonNull.list.nonNull.field('items', { type: 'PlatformAcademy' });
      t.nonNull.int('total');
    },
  });

  // ── queries ───────────────────────────────────────────────────────────────

  const Query = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.field('platformDashboard', {
        type: 'PlatformDashboard',
        resolve: async (_: any, __: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) throw new Error('Forbidden');

          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .slice(0, 10);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            .toISOString()
            .slice(0, 10);

          const [totalAcademies, activeAcademies, totalStudents, payments, openLeads, leadsThisMonth] =
            await Promise.all([
              strapi.documents(ACADEMY).count({}),
              strapi.documents(ACADEMY).count({ filters: { isActive: true } }),
              strapi.documents(STUDENT).count({ filters: { status: 'active' } }),
              strapi.documents(PAYMENT).findMany({
                filters: { status: 'paid', dueDate: { $gte: monthStart, $lt: monthEnd } },
                limit: 5000,
              }),
              strapi.documents(LEAD).count({
                filters: { status: { $in: ['new', 'contacted', 'demo_scheduled'] } },
              }),
              strapi.documents(LEAD).count({
                filters: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() } },
              }),
            ]);

          const mrr = (payments as any[]).reduce(
            (sum, p) => sum + Number(p.amount ?? 0),
            0,
          );

          return {
            totalAcademies,
            activeAcademies,
            totalStudents,
            mrr: BRL(mrr),
            openLeads,
            leadsThisMonth,
          };
        },
      });

      t.field('allAcademies', {
        type: 'PlatformAcademyList',
        args: {
          page: nexus.intArg(),
          pageSize: nexus.intArg(),
        },
        resolve: async (_: any, args: any, ctx: any) => {
          if (!(await isPlatformAdmin(strapi, ctx))) throw new Error('Forbidden');

          const page = args.page ?? 1;
          const pageSize = args.pageSize ?? 20;

          const [academies, total] = await Promise.all([
            strapi.documents(ACADEMY).findMany({
              sort: { createdAt: 'desc' },
              limit: pageSize,
              start: (page - 1) * pageSize,
            }),
            strapi.documents(ACADEMY).count({}),
          ]);

          const items = await Promise.all(
            (academies as any[]).map(async (a) => {
              const studentCount = await strapi
                .documents(STUDENT)
                .count({ filters: { academy: { documentId: a.documentId }, status: 'active' } });
              return {
                documentId: a.documentId,
                name: a.name,
                slug: a.slug,
                plan: a.plan ?? 'starter',
                isActive: a.isActive ?? true,
                email: a.email ?? null,
                studentCount,
                createdAt: a.createdAt,
              };
            }),
          );

          return { items, total };
        },
      });
    },
  });

  return {
    types: [PlatformDashboard, PlatformAcademy, PlatformAcademyList, Query],
    resolversConfig: {
      'Query.platformDashboard': { auth: true },
      'Query.allAcademies': { auth: true },
    },
  };
}
