/**
 * GraphQL schema for the BodyAssessment content type.
 *
 * Measurements is a JSON field — the agreed shape on the frontend is
 * `{ chest, waist, hips, arms, thighs, ... }` (all numbers, all optional).
 */

import type { Core } from '@strapi/strapi';

const UID = 'api::body-assessment.body-assessment';

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
      t.nonNull.id('student');
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
      t.id('student');
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
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findMany({
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { date: 'desc' },
          });
        },
      });

      t.field('bodyAssessment', {
        type: 'BodyAssessment',
        args: { documentId: nexus.nonNull.idArg() },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createBodyAssessment', {
        type: 'BodyAssessment',
        args: { data: nexus.nonNull.arg({ type: 'BodyAssessmentInput' }) },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateBodyAssessment', {
        type: 'BodyAssessment',
        args: {
          documentId: nexus.nonNull.idArg(),
          data: nexus.nonNull.arg({ type: 'BodyAssessmentUpdateInput' }),
        },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteBodyAssessment', {
        type: 'BodyAssessment',
        args: { documentId: nexus.nonNull.idArg() },
        resolve: async (_root: any, args: any) => {
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
      'Mutation.createBodyAssessment': { auth: true },
      'Mutation.updateBodyAssessment': { auth: true },
      'Mutation.deleteBodyAssessment': { auth: true },
    },
  };
}
