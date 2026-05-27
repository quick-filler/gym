/**
 * GraphQL schema for the Dependent content type.
 *
 * Tenancy via direct academy relation. The guardian (a Student) owns the
 * billing customer / payments on Asaas; the dependent is the practitioner.
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
  withAcademyScope,
} from '../helpers';

const UID = 'api::dependent.dependent';

export function buildDependent({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const Dependent = nexus.objectType({
    name: 'Dependent',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('name');
      t.nonNull.string('birthdate');
      t.string('cpf');
      t.field('address', { type: 'Address' });
      t.string('gender');
      t.string('relationship');
      t.nonNull.string('status');
      t.string('bloodType');
      t.string('allergies');
      t.string('medicalNotes');
      t.string('medicalAlert');
      t.string('emergencyContactName');
      t.string('emergencyContactPhone');
      t.field('photo', {
        type: 'Media',
        resolve: async (parent: any) => {
          if (parent.photo !== undefined) return parent.photo;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { photo: true },
          });
          return doc?.photo ?? null;
        },
      });
      t.field('guardian', {
        type: 'Student',
        resolve: async (parent: any) => {
          if (parent.guardian !== undefined) return parent.guardian;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { guardian: true },
          });
          return doc?.guardian ?? null;
        },
      });
      t.field('academy', {
        type: 'Academy',
        resolve: async (parent: any) => {
          if (parent.academy !== undefined) return parent.academy;
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { academy: true },
          });
          return doc?.academy ?? null;
        },
      });
      t.list.field('enrollments', {
        type: 'Enrollment',
        resolve: async (parent: any) => {
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { enrollments: { populate: { plan: true } } },
          });
          return doc?.enrollments ?? [];
        },
      });
      t.list.field('bookings', {
        type: 'ClassBooking',
        resolve: async (parent: any) => {
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: {
              bookings: { populate: { classSchedule: true } },
            },
          });
          return doc?.bookings ?? [];
        },
      });
      t.list.field('workoutPlans', {
        type: 'WorkoutPlan',
        resolve: async (parent: any) => {
          const doc: any = await strapi.documents(UID).findOne({
            documentId: parent.documentId,
            populate: { workoutPlans: true },
          });
          return doc?.workoutPlans ?? [];
        },
      });
    },
  });

  const DependentInput = nexus.inputObjectType({
    name: 'DependentInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.nonNull.string('birthdate');
      t.string('cpf');
      t.field('address', { type: 'AddressInput' });
      t.string('gender');
      t.string('relationship');
      t.string('status');
      t.string('bloodType');
      t.string('allergies');
      t.string('medicalNotes');
      t.string('medicalAlert');
      t.string('emergencyContactName');
      t.string('emergencyContactPhone');
      t.id('guardian');
    },
  });

  const DependentUpdateInput = nexus.inputObjectType({
    name: 'DependentUpdateInput',
    definition(t: any) {
      t.string('name');
      t.string('birthdate');
      t.string('cpf');
      t.field('address', { type: 'AddressInput' });
      t.string('gender');
      t.string('relationship');
      t.string('status');
      t.string('bloodType');
      t.string('allergies');
      t.string('medicalNotes');
      t.string('medicalAlert');
      t.string('emergencyContactName');
      t.string('emergencyContactPhone');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.list.field('dependents', {
        type: 'Dependent',
        args: { pagination: 'PaginationInput' },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = (await isPlatformAdmin(strapi, ctx))
            ? {}
            : withAcademyScope({}, academyId);
          return await strapi.documents(UID).findMany({
            filters,
            start: args.pagination?.start ?? 0,
            limit: Math.min(200, args.pagination?.limit ?? 100),
            sort: { name: 'asc' },
            populate: { guardian: true },
          });
        },
      });

      t.field('dependent', {
        type: 'Dependent',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          return await strapi.documents(UID).findOne({ documentId: args.documentId });
        },
      });

      t.list.field('myDependents', {
        type: 'Dependent',
        resolve: async (_root: any, _args: any, ctx: any) => {
          const user = ctx.state?.user;
          if (!user) return [];
          const student: any = (
            await strapi.documents('api::student.student').findMany({
              filters: { user: user.id } as any,
              populate: {
                dependents: { populate: { enrollments: { populate: { plan: true } } } },
              },
              limit: 1,
            })
          )[0];
          return student?.dependents ?? [];
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('createDependent', {
        type: 'Dependent',
        args: {
          data: nexus.nonNull(nexus.arg({ type: 'DependentInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          await requireActiveSubscription(strapi, ctx);
          const academyId = await requireAcademyId(strapi, ctx);

          // Guardian (when provided) must belong to the same academy.
          if (args.data.guardian) {
            const ga = await resolveDocAcademyId(
              strapi,
              'api::student.student',
              args.data.guardian,
            );
            if (ga !== academyId) {
              throw new Error('Responsável de outra academia.');
            }
          }

          const created = await strapi.documents(UID).create({
            data: { ...args.data, academy: academyId },
          });
          if (args.data.guardian) {
            await strapi.documents('api::student.student').update({
              documentId: args.data.guardian,
              data: { isGuardian: true } as any,
            });
          }
          return created;
        },
      });

      t.field('updateDependent', {
        type: 'Dependent',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'DependentUpdateInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin']);
          await requireActiveSubscription(strapi, ctx);
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: args.data,
          });
        },
      });

      t.field('deleteDependent', {
        type: 'Dependent',
        args: { documentId: nexus.nonNull(nexus.idArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await assertCanAccessDoc(strapi, ctx, UID, args.documentId);
          await requireRole(strapi, ctx, ['academy_admin']);
          await requireActiveSubscription(strapi, ctx);
          const doc = await strapi
            .documents(UID)
            .findOne({ documentId: args.documentId });
          await strapi.documents(UID).delete({ documentId: args.documentId });
          return doc;
        },
      });
    },
  });

  return {
    types: [
      Dependent,
      DependentInput,
      DependentUpdateInput,
      queries,
      mutations,
    ],
    resolversConfig: {
      'Query.dependents': { auth: true },
      'Query.dependent': { auth: true },
      'Query.myDependents': { auth: true },
      'Mutation.createDependent': { auth: true },
      'Mutation.updateDependent': { auth: true },
      'Mutation.deleteDependent': { auth: true },
    },
  };
}
