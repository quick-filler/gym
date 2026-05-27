/**
 * GraphQL para Pool — agrupa PoolSettings (config por academia) e
 * PoolInspection (registro diário de medição).
 *
 * Tenancy: tudo academy-scoped via PoolSettings.academy /
 * PoolInspection.academy. Mutations CRUD passam pelo
 * requireActiveSubscription pra manter o soft-block coerente.
 *
 * Cálculo de status: derivado dos parâmetros da PoolSettings da
 * academia. Faixa `[min, max]` = ok. Fora da faixa mas dentro de
 * `[min - tol, max + tol]` = warning. Fora dessa segunda faixa =
 * critical. Cada métrica (ph/chlorine/temperature) é avaliada
 * separadamente e o pior status entre as três vira o status final
 * da inspeção.
 */

import type { Core } from '@strapi/strapi';
import {
  isPlatformAdmin,
  requireAcademyId,
  requireActiveSubscription,
  requireRole,
  resolveUserAcademyId,
} from '../helpers';

// Casts as any porque contentTypes.d.ts só conhece os novos UIDs
// depois do próximo boot do Strapi.
const SETTINGS_UID = 'api::pool-setting.pool-setting' as any;
const INSPECTION_UID = 'api::pool-inspection.pool-inspection' as any;
const ACADEMY_UID = 'api::academy.academy';

type Status = 'ok' | 'warning' | 'critical';

/**
 * Classifica um valor frente à faixa ideal + tolerância. Null/undefined
 * devolve 'ok' (medição opcional, não deve degradar status).
 */
function classify(
  value: number | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined,
  tolerance: number,
): Status {
  if (value == null || min == null || max == null) return 'ok';
  if (value >= min && value <= max) return 'ok';
  if (value >= min - tolerance && value <= max + tolerance) return 'warning';
  return 'critical';
}

function worst(...statuses: Status[]): Status {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'ok';
}

export function buildPool({ nexus, strapi }: { nexus: any; strapi: Core.Strapi }) {
  const PoolSettings = nexus.objectType({
    name: 'PoolSettings',
    description:
      'Per-academy pool target ranges (defaults: pH 7.2–7.8, chlorine 1–3, temp 28–31°C — Brazilian legislation).',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.float('phMin');
      t.float('phMax');
      t.float('chlorineMin');
      t.float('chlorineMax');
      t.float('temperatureMin');
      t.float('temperatureMax');
      t.float('alertTolerance');
      t.list.string('inspectionTimes');
    },
  });

  const PoolSettingsInput = nexus.inputObjectType({
    name: 'PoolSettingsInput',
    definition(t: any) {
      t.float('phMin');
      t.float('phMax');
      t.float('chlorineMin');
      t.float('chlorineMax');
      t.float('temperatureMin');
      t.float('temperatureMax');
      t.float('alertTolerance');
      t.list.string('inspectionTimes');
    },
  });

  const PoolInspection = nexus.objectType({
    name: 'PoolInspection',
    definition(t: any) {
      t.nonNull.id('documentId');
      t.nonNull.string('date');
      t.nonNull.string('shift');
      t.string('scheduledTime');
      t.float('chlorine');
      t.float('ph');
      t.float('temperature');
      t.int('peopleCount');
      t.string('peopleCountSource');
      t.string('notes');
      t.string('createdAt');
      t.nonNull.string('status', {
        description:
          'Computed: ok / warning / critical. Derived from the academy\'s PoolSettings target ranges + alertTolerance.',
        resolve: async (parent: any) => {
          const settingsRows: any[] = await strapi
            .documents(SETTINGS_UID)
            .findMany({
              filters: {
                academy: { documentId: parent.academy?.documentId } as any,
              } as any,
              limit: 1,
            });
          const s = settingsRows[0];
          if (!s) return 'ok';
          const tol = Number(s.alertTolerance ?? 0);
          return worst(
            classify(parent.ph, s.phMin, s.phMax, tol),
            classify(parent.chlorine, s.chlorineMin, s.chlorineMax, tol),
            classify(parent.temperature, s.temperatureMin, s.temperatureMax, tol),
          );
        },
      });
    },
  });

  const PoolInspectionInput = nexus.inputObjectType({
    name: 'PoolInspectionInput',
    definition(t: any) {
      t.nonNull.string('date');
      t.nonNull.string('shift'); // morning | evening
      t.string('scheduledTime');
      t.float('chlorine');
      t.float('ph');
      t.float('temperature');
      t.int('peopleCount');
      t.string('peopleCountSource');
      t.string('notes');
    },
  });

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      t.field('myPoolSettings', {
        type: 'PoolSettings',
        description: "Pool settings for the caller's academy.",
        resolve: async (_: any, __: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          if (!academyId) return null;
          const rows: any[] = await strapi.documents(SETTINGS_UID).findMany({
            filters: { academy: { documentId: academyId } } as any,
            limit: 1,
          });
          return rows[0] ?? null;
        },
      });

      t.list.field('poolInspections', {
        type: 'PoolInspection',
        description:
          "Inspections for the caller's academy. Optional `date` filters to a single day; otherwise returns the most recent 60 ordered by date desc.",
        args: { date: nexus.stringArg() },
        resolve: async (_: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          if (!academyId) return [];
          const filters: any = { academy: { documentId: academyId } };
          if (args.date) filters.date = args.date;
          const rows: any[] = await strapi.documents(INSPECTION_UID).findMany({
            filters,
            sort: { date: 'desc', shift: 'asc' } as any,
            limit: args.date ? 2 : 60,
            populate: { academy: { fields: ['documentId'] } } as any,
          });
          return rows;
        },
      });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('updateMyPoolSettings', {
        type: 'PoolSettings',
        args: { data: nexus.nonNull(nexus.arg({ type: 'PoolSettingsInput' })) },
        resolve: async (_: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          await requireActiveSubscription(strapi, ctx);
          const academyId = await requireAcademyId(strapi, ctx);
          const rows: any[] = await strapi.documents(SETTINGS_UID).findMany({
            filters: { academy: { documentId: academyId } } as any,
            limit: 1,
          });
          const existing = rows[0];
          if (existing) {
            return await strapi.documents(SETTINGS_UID).update({
              documentId: existing.documentId,
              data: args.data,
            });
          }
          // Defesa: se ainda não existe (academia antiga sem backfill),
          // cria agora.
          return await strapi.documents(SETTINGS_UID).create({
            data: { ...args.data, academy: academyId } as any,
          });
        },
      });

      t.field('createPoolInspection', {
        type: 'PoolInspection',
        args: {
          data: nexus.nonNull(nexus.arg({ type: 'PoolInspectionInput' })),
        },
        resolve: async (_: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);
          await requireActiveSubscription(strapi, ctx);
          const academyId = await requireAcademyId(strapi, ctx);
          const userId = ctx?.state?.user?.id ?? null;
          return await strapi.documents(INSPECTION_UID).create({
            data: {
              ...args.data,
              academy: academyId,
              // Custom field — não confundir com o `createdBy` reservado
              // do Strapi (esse aponta pra admin::user e é setado
              // automaticamente). `recordedBy` é o instrutor/admin da
              // academia que registrou a medição.
              recordedBy: userId,
            } as any,
            populate: { academy: { fields: ['documentId'] } } as any,
          });
        },
      });

      t.field('updatePoolInspection', {
        type: 'PoolInspection',
        args: {
          documentId: nexus.nonNull(nexus.idArg()),
          data: nexus.nonNull(nexus.arg({ type: 'PoolInspectionInput' })),
        },
        resolve: async (_: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin', 'instructor']);
          await requireActiveSubscription(strapi, ctx);
          // Validação de academia: ler doc e checar `academy.documentId`
          // == caller academy. Platform admin pula.
          if (!(await isPlatformAdmin(strapi, ctx))) {
            const callerAcademy = await resolveUserAcademyId(strapi, ctx);
            const doc: any = await strapi.documents(INSPECTION_UID).findOne({
              documentId: args.documentId,
              populate: { academy: { fields: ['documentId'] } } as any,
            });
            if (!doc) throw new Error('Inspeção não encontrada.');
            if (doc.academy?.documentId !== callerAcademy) {
              throw new Error('Acesso negado: inspeção de outra academia.');
            }
          }
          return await strapi.documents(INSPECTION_UID).update({
            documentId: args.documentId,
            data: args.data,
            populate: { academy: { fields: ['documentId'] } } as any,
          });
        },
      });
    },
  });

  return {
    types: [
      PoolSettings,
      PoolSettingsInput,
      PoolInspection,
      PoolInspectionInput,
      queries,
      mutations,
    ],
    resolversConfig: {
      'Query.myPoolSettings': { auth: true },
      'Query.poolInspections': { auth: true },
      'Mutation.updateMyPoolSettings': { auth: true },
      'Mutation.createPoolInspection': { auth: true },
      'Mutation.updatePoolInspection': { auth: true },
    },
  };
}
