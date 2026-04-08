/**
 * GraphQL schema for the WorkoutPlan content type.
 *
 * Exercises is a JSON field — exposed as a generic JSON scalar. The frontend
 * is responsible for shape validation against the agreed schema:
 * `Array<{ name, sets, reps, load, notes }>`.
 */

import type { Core } from '@strapi/strapi';

const UID = 'api::workout-plan.workout-plan';

export function buildWorkoutPlan({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const Exercise = nexus.objectType({
    name: 'Exercise',
    definition(t: any) {
      t.nonNull.string('name');
      t.int('sets');
      t.int('reps');
      t.string('load');
      t.string('notes');
    },
  });

  const ExerciseInput = nexus.inputObjectType({
    name: 'ExerciseInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.int('sets');
      t.int('reps');
      t.string('load');
      t.string('notes');
    },
  });

  const WorkoutPlan = nexus.objectType({
    name: 'WorkoutPlan',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('name');
      t.string('instructor');
      t.list.field('exercises', { type: 'Exercise' });
      t.string('validFrom');
      t.string('validTo');
      t.boolean('isActive');
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

  const WorkoutPlanInput = nexus.inputObjectType({
    name: 'WorkoutPlanInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.nonNull.id('student');
      t.string('instructor');
      t.list.field('exercises', { type: 'ExerciseInput' });
      t.string('validFrom');
      t.string('validTo');
      t.boolean('isActive');
    },
  });

  const WorkoutPlanUpdateInput = nexus.inputObjectType({
    name: 'WorkoutPlanUpdateInput',
    definition(t: any) {
      t.string('name');
      t.id('student');
      t.string('instructor');
      t.list.field('exercises', { type: 'ExerciseInput' });
      t.string('validFrom');
      t.string('validTo');
      t.boolean('isActive');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('workoutPlans', {
        type: 'WorkoutPlan',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).findMany({
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { validFrom: 'desc' },
          });
        },
      });

      t.field('workoutPlan', {
        type: 'WorkoutPlan',
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
      t.field('createWorkoutPlan', {
        type: 'WorkoutPlan',
        args: { data: nexus.nonNull.arg({ type: 'WorkoutPlanInput' }) },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).create({ data: args.data });
        },
      });

      t.field('updateWorkoutPlan', {
        type: 'WorkoutPlan',
        args: {
          documentId: nexus.nonNull.idArg(),
          data: nexus.nonNull.arg({ type: 'WorkoutPlanUpdateInput' }),
        },
        resolve: async (_root: any, args: any) => {
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteWorkoutPlan', {
        type: 'WorkoutPlan',
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
      Exercise,
      ExerciseInput,
      WorkoutPlan,
      WorkoutPlanInput,
      WorkoutPlanUpdateInput,
      queries,
      mutations,
    ],
    resolversConfig: {
      'Query.workoutPlans': { auth: true },
      'Query.workoutPlan': { auth: true },
      'Mutation.createWorkoutPlan': { auth: true },
      'Mutation.updateWorkoutPlan': { auth: true },
      'Mutation.deleteWorkoutPlan': { auth: true },
    },
  };
}
