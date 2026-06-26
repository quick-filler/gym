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
  requireModule,
  requireRole,
  requireActiveSubscription,
  resolveDocAcademyId,
  resolveUserAcademyId,
  withAcademyScope,
} from '../helpers';

const UID = 'api::dependent.dependent';
const STUDENT_UID = 'api::student.student';

/**
 * Fields a guardian may set on their own dependent through self-service.
 * This whitelist is the security boundary: `guardian`, `academy`, `status`
 * and `enrollments` are deliberately absent — they are forced by the resolver
 * (guardian/academy) or admin-only (status/enrollments / billing).
 */
export const MY_DEPENDENT_FIELDS = [
  'name',
  'birthdate',
  'cpf',
  'gender',
  'relationship',
  'address',
  'bloodType',
  'allergies',
  'medicalNotes',
  'medicalAlert',
  'emergencyContactName',
  'emergencyContactPhone',
  'photo',
] as const;

/** Keeps only guardian-editable fields; normalizes birthdate to yyyy-mm-dd. */
export function pickDependentFields(input: any): Record<string, any> {
  const out: Record<string, any> = {};
  for (const key of MY_DEPENDENT_FIELDS) {
    if (input?.[key] !== undefined) out[key] = input[key];
  }
  if (typeof out.birthdate === 'string') out.birthdate = out.birthdate.slice(0, 10);
  return out;
}

/** Resolves the authenticated user's Student (documentId + academy). */
async function resolveCallerStudent(
  strapi: Core.Strapi,
  ctx: any,
): Promise<{ documentId: string; academyId: string | null } | null> {
  const userId = ctx?.state?.user?.id;
  if (!userId) return null;
  const rows: any[] = await strapi.documents(STUDENT_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    populate: { academy: { fields: ['documentId'] } },
    limit: 1,
  });
  const me = rows[0];
  if (!me?.documentId) return null;
  return { documentId: me.documentId, academyId: me.academy?.documentId ?? null };
}

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

  // Guardian self-service inputs (app). Narrower than the admin inputs:
  // no guardian/academy/status — those are forced/owned server-side.
  const MyDependentInput = nexus.inputObjectType({
    name: 'MyDependentInput',
    definition(t: any) {
      t.nonNull.string('name');
      t.nonNull.string('birthdate');
      t.string('cpf');
      t.string('gender');
      t.string('relationship');
      t.field('address', { type: 'AddressInput' });
      t.string('bloodType');
      t.string('allergies');
      t.string('medicalNotes');
      t.string('medicalAlert');
      t.string('emergencyContactName');
      t.string('emergencyContactPhone');
      t.id('photo');
    },
  });

  const MyDependentUpdateInput = nexus.inputObjectType({
    name: 'MyDependentUpdateInput',
    definition(t: any) {
      t.string('name');
      t.string('birthdate');
      t.string('cpf');
      t.string('gender');
      t.string('relationship');
      t.field('address', { type: 'AddressInput' });
      t.string('bloodType');
      t.string('allergies');
      t.string('medicalNotes');
      t.string('medicalAlert');
      t.string('emergencyContactName');
      t.string('emergencyContactPhone');
      t.id('photo');
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
          await requireModule(strapi, ctx, 'dependents');
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

      t.field('addMyDependent', {
        type: 'Dependent',
        description:
          'Guardian self-service: registers a new dependent owned by the caller, in the caller’s academy. Auth only — managing family data is not a paid action, so no admin role or active subscription is required (booking still gates on the dependent’s enrollment).',
        args: { input: nexus.nonNull(nexus.arg({ type: 'MyDependentInput' })) },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'dependents');
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me) throw new Error('Sua conta não está vinculada a um aluno.');
          if (!me.academyId) {
            throw new Error('Sua conta não está vinculada a nenhuma academia.');
          }
          const created = await strapi.documents(UID).create({
            data: {
              ...pickDependentFields(args.input),
              guardian: me.documentId,
              academy: me.academyId,
            } as any,
          });
          // Flag the guardian so the dashboard surfaces the dependents area.
          await strapi.documents(STUDENT_UID).update({
            documentId: me.documentId,
            data: { isGuardian: true } as any,
          });
          return created;
        },
      });

      t.field('updateMyDependent', {
        type: 'Dependent',
        description:
          'Guardian self-service: edits a dependent the caller owns. Whitelisted fields only; guardian / academy / status are immutable here.',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          input: nexus.nonNull(nexus.arg({ type: 'MyDependentUpdateInput' })),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireModule(strapi, ctx, 'dependents');
          const me = await resolveCallerStudent(strapi, ctx);
          if (!me) throw new Error('Sua conta não está vinculada a um aluno.');
          const dep: any = await strapi.documents(UID).findOne({
            documentId: args.documentId,
            fields: ['documentId'],
            populate: { guardian: { fields: ['documentId'] } },
          });
          if (!dep) throw new Error('Dependente não encontrado.');
          if (dep.guardian?.documentId !== me.documentId) {
            throw new Error('Dependente não pertence a esta conta.');
          }
          return await strapi.documents(UID).update({
            documentId: args.documentId,
            data: pickDependentFields(args.input),
          });
        },
      });
    },
  });

  return {
    types: [
      Dependent,
      DependentInput,
      DependentUpdateInput,
      MyDependentInput,
      MyDependentUpdateInput,
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
      'Mutation.addMyDependent': { auth: true },
      'Mutation.updateMyDependent': { auth: true },
    },
  };
}
