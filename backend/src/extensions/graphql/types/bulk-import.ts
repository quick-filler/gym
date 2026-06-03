/**
 * Bulk import — recebe linhas já parseadas (no website) de uma planilha
 * de cadastro e cria Student (adultos) ou Student responsável + Dependent
 * (família). Detecção de duplicidade é por (academy, cpf) com fallback
 * para (academy, email) no caso de adulto e (guardian, name+birthdate)
 * para dependente. Toda linha que falha vira um item em `errors` ao invés
 * de derrubar o batch — o admin precisa ver tudo de uma vez no preview.
 */

import type { Core } from '@strapi/strapi';
import {
  requireAcademyId,
  requireActiveSubscription,
  requireRole,
} from '../helpers';
import { ensureAuthUser } from '../../../lib/provisioning';

const STUDENT_UID = 'api::student.student';
const DEPENDENT_UID = 'api::dependent.dependent';

export function buildBulkImport({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  const StudentImportRow = nexus.inputObjectType({
    name: 'StudentImportRow',
    definition(t: any) {
      t.nonNull.string('kind'); // 'student' | 'family'
      // Aluno adulto OU responsável (quando kind=family).
      t.nonNull.string('name');
      t.nonNull.string('email');
      t.string('phone');
      t.string('cpf');
      t.string('gender');
      t.string('birthdate');
      t.field('address', { type: 'AddressInput' });
      // Só usado quando kind=family — descreve o dependente.
      t.string('dependentName');
      t.string('dependentBirthdate');
      t.string('dependentCpf');
      t.string('dependentGender');
      t.string('emergencyContactName');
      t.string('emergencyContactPhone');
      // Usado pelo cliente para correlacionar erros de volta à linha original.
      t.int('rowNumber');
    },
  });

  const BulkImportItem = nexus.objectType({
    name: 'BulkImportItem',
    definition(t: any) {
      t.nonNull.int('rowNumber');
      t.nonNull.string('status'); // 'created' | 'updated' | 'skipped' | 'error'
      t.string('studentDocumentId');
      t.string('dependentDocumentId');
      t.string('message');
    },
  });

  const BulkImportResult = nexus.objectType({
    name: 'BulkImportResult',
    definition(t: any) {
      t.nonNull.int('created');
      t.nonNull.int('skipped');
      t.nonNull.int('errors');
      t.nonNull.list.field('items', { type: nexus.nonNull('BulkImportItem') });
    },
  });

  const mutations = nexus.extendType({
    type: 'Mutation',
    definition(t: any) {
      t.field('bulkImportStudents', {
        type: 'BulkImportResult',
        args: {
          rows: nexus.nonNull(
            nexus.list(nexus.nonNull(nexus.arg({ type: 'StudentImportRow' }))),
          ),
          dryRun: nexus.booleanArg({ default: false }),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          await requireRole(strapi, ctx, ['academy_admin']);
          await requireActiveSubscription(strapi, ctx);
          const academyId = await requireAcademyId(strapi, ctx);

          const items: Array<{
            rowNumber: number;
            status: string;
            studentDocumentId?: string | null;
            dependentDocumentId?: string | null;
            message?: string | null;
          }> = [];
          let created = 0;
          let skipped = 0;
          let errors = 0;

          for (let i = 0; i < (args.rows as any[]).length; i++) {
            const row = args.rows[i];
            const rowNumber = row.rowNumber ?? i + 1;
            try {
              if (!row.name || !row.email) {
                throw new Error('Nome e e-mail são obrigatórios.');
              }
              const guardian = await findOrCreateStudent({
                strapi,
                academyId,
                row,
                isGuardian: row.kind === 'family',
                dryRun: !!args.dryRun,
              });

              if (row.kind === 'family') {
                if (!row.dependentName || !row.dependentBirthdate) {
                  throw new Error(
                    'Família precisa de nome e data de nascimento do dependente.',
                  );
                }
                const dep = await findOrCreateDependent({
                  strapi,
                  academyId,
                  guardianId: guardian.documentId,
                  row,
                  dryRun: !!args.dryRun,
                });
                items.push({
                  rowNumber,
                  status: dep.status,
                  studentDocumentId: guardian.documentId,
                  dependentDocumentId: dep.documentId,
                });
                if (dep.status === 'created' || guardian.status === 'created')
                  created++;
                else skipped++;
              } else {
                items.push({
                  rowNumber,
                  status: guardian.status,
                  studentDocumentId: guardian.documentId,
                });
                if (guardian.status === 'created') created++;
                else skipped++;
              }
            } catch (err: any) {
              errors++;
              items.push({
                rowNumber,
                status: 'error',
                message: err?.message ?? 'Erro desconhecido.',
              });
            }
          }

          return { created, skipped, errors, items };
        },
      });
    },
  });

  return {
    types: [StudentImportRow, BulkImportItem, BulkImportResult, mutations],
    resolversConfig: {
      'Mutation.bulkImportStudents': { auth: true },
    },
  };
}

async function findOrCreateStudent({
  strapi,
  academyId,
  row,
  isGuardian,
  dryRun,
}: {
  strapi: Core.Strapi;
  academyId: string;
  row: any;
  isGuardian: boolean;
  dryRun: boolean;
}): Promise<{ documentId: string; status: 'created' | 'skipped' }> {
  const filters: any = { academy: { documentId: academyId } };
  if (row.cpf) filters.cpf = row.cpf;
  else filters.email = row.email;

  const existing: any[] = await strapi.documents(STUDENT_UID).findMany({
    filters,
    limit: 1,
  });
  if (existing[0]) {
    // Promove a flag se o aluno já existia como adulto e agora é responsável
    // de um dependente sendo importado nesta mesma rodada.
    if (isGuardian && !existing[0].isGuardian && !dryRun) {
      await strapi.documents(STUDENT_UID).update({
        documentId: existing[0].documentId,
        data: { isGuardian: true } as any,
      });
    }
    return { documentId: existing[0].documentId, status: 'skipped' };
  }
  if (dryRun) {
    return { documentId: 'dry-run', status: 'created' };
  }
  // Provision (or link) a login account so imported adults can sign in to
  // the app. No welcome email here — a batch of 200 rows should not fire
  // 200 emails; invites are sent later from the UI (or the student uses
  // "esqueci a senha"). Dependents never get a login (managed by guardian).
  const { userId } = await ensureAuthUser(strapi, { email: row.email });
  const data: any = {
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    cpf: row.cpf || undefined,
    gender: row.gender || undefined,
    birthdate: row.birthdate || undefined,
    address: row.address || undefined,
    role: 'member',
    status: 'active',
    isGuardian: isGuardian || undefined,
    academy: academyId,
    user: userId,
  };
  const doc = await strapi.documents(STUDENT_UID).create({ data });
  return { documentId: (doc as any).documentId, status: 'created' };
}

async function findOrCreateDependent({
  strapi,
  academyId,
  guardianId,
  row,
  dryRun,
}: {
  strapi: Core.Strapi;
  academyId: string;
  guardianId: string;
  row: any;
  dryRun: boolean;
}): Promise<{ documentId: string; status: 'created' | 'skipped' }> {
  const filters: any = { academy: { documentId: academyId } };
  if (row.dependentCpf) {
    filters.cpf = row.dependentCpf;
  } else {
    filters.name = row.dependentName;
    filters.birthdate = row.dependentBirthdate;
  }
  const existing: any[] = await strapi.documents(DEPENDENT_UID).findMany({
    filters,
    limit: 1,
  });
  if (existing[0]) {
    return { documentId: existing[0].documentId, status: 'skipped' };
  }
  if (dryRun) {
    return { documentId: 'dry-run', status: 'created' };
  }
  const data: any = {
    name: row.dependentName,
    birthdate: row.dependentBirthdate,
    cpf: row.dependentCpf || undefined,
    gender: row.dependentGender || undefined,
    address: row.address || undefined,
    emergencyContactName: row.emergencyContactName || undefined,
    emergencyContactPhone: row.emergencyContactPhone || undefined,
    status: 'active',
    guardian: guardianId,
    academy: academyId,
  };
  const doc = await strapi.documents(DEPENDENT_UID).create({ data });
  return { documentId: (doc as any).documentId, status: 'created' };
}
