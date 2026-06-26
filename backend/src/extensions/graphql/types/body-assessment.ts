/**
 * GraphQL schema for the BodyAssessment content type.
 *
 * Tenancy via student/dependent → academy. Owned by both academy_admin and
 * instructor (instructors typically run the avaliação física).
 */

import type { Core } from '@strapi/strapi';
import {
  assertCanAccessDoc,
  isPlatformAdmin,
  requireAcademyId,
  requireRole,
  requireActiveSubscription,
  resolveDocAcademyId,
  resolveUserAcademyId,
  withStudentScope,
} from '../helpers';

const UID = 'api::body-assessment.body-assessment';
const STUDENT_UID = 'api::student.student';

/* ------------------------------------------------------------------
 * Pure helpers (exported for unit tests)
 * ------------------------------------------------------------------ */

/**
 * Body Mass Index from weight (kg) and height. Height is accepted in
 * metres (1.78) or centimetres (178) — values > 3 are treated as cm.
 * Returns one-decimal BMI, or null when inputs are missing/invalid.
 */
export function computeBMI(
  weight: number | null | undefined,
  height: number | null | undefined,
): number | null {
  const w = Number(weight);
  let h = Number(height);
  if (!w || !h || w <= 0 || h <= 0) return null;
  if (h > 3) h = h / 100; // cm → m
  const bmi = w / (h * h);
  if (!isFinite(bmi)) return null;
  return Math.round(bmi * 10) / 10;
}

/** Sort assessments newest-first by `date` (yyyy-mm-dd), stable. */
export function sortAssessmentsDesc<T extends { date?: string | null }>(list: T[]): T[] {
  return [...(list ?? [])].sort((a, b) =>
    String(b?.date ?? '').localeCompare(String(a?.date ?? '')),
  );
}

/** documentId of the Student linked to the authenticated user, or null. */
async function resolveCallerStudentId(
  strapi: Core.Strapi,
  ctx: any,
): Promise<string | null> {
  const userId = ctx?.state?.user?.id;
  if (!userId) return null;
  const rows: any[] = await strapi.documents(STUDENT_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return rows[0]?.documentId ?? null;
}

export function buildBodyAssessment({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const Measurements = nexus.objectType({
    name: 'Measurements',
    definition(t: any) {
      t.float('chest');
      t.float('waist');
      t.float('hips');
      t.float('arms');
      t.float('thighs');
      t.float('calves');
      t.float('shoulders');
    },
  });

  const MeasurementsInput = nexus.inputObjectType({
    name: 'MeasurementsInput',
    definition(t: any) {
      t.float('chest');
      t.float('waist');
      t.float('hips');
      t.float('arms');
      t.float('thighs');
      t.float('calves');
      t.float('shoulders');
    },
  });

  const BodyAssessment = nexus.objectType({
    name: 'BodyAssessment',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.string('instructor');
      t.nonNull.string('date');
      t.float('weight');
      t.float('height');
      t.float('bodyFat');
      t.field('bmi', {
        type: 'Float',
        description: 'Derived from weight + height (height in m or cm). Null when either is missing.',
        resolve: (parent: any) => computeBMI(parent?.weight, parent?.height),
      });
      t.field('measurements', { type: 'Measurements' });
      t.string('notes');
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

  const BodyAssessmentInput = nexus.inputObjectType({
    name: 'BodyAssessmentInput',
    definition(t: any) {
      t.id('student');
      t.id('dependent');
      t.nonNull.string('date');
      t.string('instructor');
      t.float('weight');
      t.float('height');
      t.float('bodyFat');
      t.field('measurements', { type: 'MeasurementsInput' });
      t.string('notes');
    },
  });

  const BodyAssessmentUpdateInput = nexus.inputObjectType({
    name: 'BodyAssessmentUpdateInput',
    definition(t: any) {
      t.string('date');
      t.string('instructor');
      t.float('weight');
      t.float('height');
      t.float('bodyFat');
      t.field('measurements', { type: 'MeasurementsInput' });
      t.string('notes');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('bodyAssessments', {
        type: 'BodyAssessment',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = (await isPlatformAdmin(strapi, ctx))
            ? {}
            : withStudentScope({}, academyId);
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { date: 'desc' },
          });
        },
      });

      t.field('bodyAssessment', {
        type: 'BodyAssessment',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });

      // Student-facing: the caller's own avaliações físicas (Perfil tab).
      t.list.field('myBodyAssessments', {
        type: 'BodyAssessment',
        args: { limit: 'Int', offset: 'Int' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const meId = await resolveCallerStudentId(strapi, ctx);
          if (!meId) return [];
          return await strapi.documents(UID).findMany({
            filters: { student: { documentId: meId } } as any,
            start: args.offset ?? 0,
            limit: Math.min(100, args.limit ?? 24),
            sort: { date: 'desc' },
          });
        },
      });

      t.field('myLatestAssessment', {
        type: 'BodyAssessment',
        description: "The caller's most recent avaliação física, or null.",
        resolve: async (_root: any, _args: any, ctx: any) => {
          const meId = await resolveCallerStudentId(strapi, ctx);
          if (!meId) return null;
          const rows: any[] = await strapi.documents(UID).findMany({
            filters: { student: { documentId: meId } } as any,
            sort: { date: 'desc' },
            limit: 1,
          });
          return rows[0] ?? null;
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createBodyAssessment', {
        type: 'BodyAssessment',
        args: { data: nexus.nonNull(nexus.arg({ type: 'BodyAssessmentInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);
          await requireActiveSubscription(strapi, ctx);
          const academyId = await requireAcademyId(strapi, ctx);
          if (!args.data.student && !args.data.dependent) {
            throw new Error('Informe o aluno ou o dependente.');
          }
          if (args.data.student) {
            const a = await resolveDocAcademyId(
              strapi,
              'api::student.student',
              args.data.student,
            );
            if (a !== academyId) throw new Error('Aluno de outra academia.');
          }
          if (args.data.dependent) {
            const a = await resolveDocAcademyId(
              strapi,
              'api::dependent.dependent',
              args.data.dependent,
            );
            if (a !== academyId) throw new Error('Dependente de outra academia.');
          }
          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateBodyAssessment', {
        type: 'BodyAssessment',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'BodyAssessmentUpdateInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);
          await requireActiveSubscription(strapi, ctx);
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteBodyAssessment', {
        type: 'BodyAssessment',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);
          await requireActiveSubscription(strapi, ctx);
          const doc = await strapi.documents(UID).findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });
    },
  });

  return {
    types: [
      Measurements,
      MeasurementsInput,
      BodyAssessment,
      BodyAssessmentInput,
      BodyAssessmentUpdateInput,
      queries,
      mutations,
    ],
    resolversConfig: {
      'Query.bodyAssessments': { auth: true },
      'Query.bodyAssessment': { auth: true },
      'Query.myBodyAssessments': { auth: true },
      'Query.myLatestAssessment': { auth: true },
      'Mutation.createBodyAssessment': { auth: true },
      'Mutation.updateBodyAssessment': { auth: true },
      'Mutation.deleteBodyAssessment': { auth: true },
    },
  };
}
