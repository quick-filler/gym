/**
 * GraphQL schema for the WorkoutPlan content type.
 *
 * Tenancy via student/dependent → academy. Both academy_admin and
 * instructor can manage workouts (instructors typically own the
 * pedagogical layer).
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
  withWorkoutPlanScope,
} from '../helpers';

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
      t.string('category'); // 'gym' (default) | 'pool' (Piscina)
      t.list.field('exercises', { type: 'Exercise' });
      t.string('validFrom');
      t.string('validTo');
      t.boolean('isActive');
      t.list.field('students', {
        type: 'Student',
        description: 'The roster of students assigned to this ficha/activity.',
        resolve: async (parent: any) => {
          if (parent.students !== undefined) return parent.students;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { students: true },
          });
          return doc?.students ?? [];
        },
      });
    },
  });

  const WorkoutPlanInput = nexus.inputObjectType({
    name: 'WorkoutPlanInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.list.id('students'); // roster (manyToMany)
      t.id('dependent');
      t.string('instructor');
      t.string('category');
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
      t.string('instructor');
      t.string('category');
      t.list.id('students'); // editable roster — replaces the set when sent
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
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = (await isPlatformAdmin(strapi, ctx))
            ? {}
            : withWorkoutPlanScope({}, academyId);
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(100, args.pagination?.limit ?? 25),
            sort: { validFrom: 'desc' },
          });
        },
      });

      t.field('workoutPlan', {
        type: 'WorkoutPlan',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
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
        args: { data: nexus.nonNull(nexus.arg({ type: 'WorkoutPlanInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);
          await requireActiveSubscription(strapi, ctx);
          const academyId = await requireAcademyId(strapi, ctx);
          const students: string[] = Array.isArray(args.data.students)
            ? args.data.students.filter(Boolean)
            : [];
          if (students.length === 0 && !args.data.dependent) {
            throw new Error('Informe ao menos um aluno ou o dependente.');
          }
          // Every rostered student must belong to the caller's academy.
          for (const studentId of students) {
            const a = await resolveDocAcademyId(
              strapi,
              'api::student.student',
              studentId,
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

      t.field('updateWorkoutPlan', {
        type: 'WorkoutPlan',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'WorkoutPlanUpdateInput' })),
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

      t.field('deleteWorkoutPlan', {
        type: 'WorkoutPlan',
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
