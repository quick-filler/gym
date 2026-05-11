/**
 * Dependent lifecycle hooks.
 *
 * Defense-in-depth:
 *   1. guardian (a Student) and dependent must belong to the same Academy.
 *   2. (academy, cpf) é único — mesmo CPF em academias diferentes é
 *      permitido (multi-tenant SaaS), mas duplicado dentro da mesma
 *      academia é bloqueado. Roda em GraphQL e na admin UI do Strapi.
 */

import { pickRelationId, resolveNumericId } from '../../../../utils/relation';

const UID = 'api::dependent.dependent';
const STUDENT = 'api::student.student';
const ACADEMY = 'api::academy.academy';

async function academyOf(uid: string, id: number): Promise<number | null> {
  const row: any = await strapi.db.query(uid).findOne({
    where: { id },
    populate: { academy: { select: ['id'] } },
  });
  return row?.academy?.id ?? null;
}

async function findCpfDuplicate(params: {
  cpf: string;
  academyId: number;
  excludeId?: number;
}): Promise<boolean> {
  const where: any = {
    cpf: params.cpf,
    academy: { id: params.academyId },
  };
  if (params.excludeId) where.id = { $ne: params.excludeId };
  const existing = await strapi.db
    .query(UID)
    .findOne({ where, select: ['id'] });
  return !!existing;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    const guardianRef = pickRelationId(data?.guardian);
    const academyRef = pickRelationId(data?.academy);
    const academyId = await resolveNumericId(ACADEMY, academyRef);
    if (!academyId) return;

    if (guardianRef) {
      const guardianNumeric = await resolveNumericId(STUDENT, guardianRef);
      if (guardianNumeric) {
        const guardianAcademy = await academyOf(STUDENT, guardianNumeric);
        if (guardianAcademy && guardianAcademy !== academyId) {
          throw new Error('Responsável (guardian) pertence a outra academia.');
        }
      }
    }

    if (data?.cpf && (await findCpfDuplicate({ cpf: data.cpf, academyId }))) {
      throw new Error(
        `Já existe um dependente com o CPF "${data.cpf}" nesta academia.`,
      );
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    if (!data?.guardian && !data?.academy && !data?.cpf) return;

    const current: any = await strapi.db
      .query(UID)
      .findOne({ where, populate: { academy: { select: ['id'] } } });
    if (!current) return;

    const newAcademyId =
      data?.academy !== undefined
        ? await resolveNumericId(ACADEMY, pickRelationId(data.academy))
        : current.academy?.id;

    const guardianRef = pickRelationId(data?.guardian);
    if (guardianRef && newAcademyId) {
      const guardianNumeric = await resolveNumericId(STUDENT, guardianRef);
      if (guardianNumeric) {
        const guardianAcademy = await academyOf(STUDENT, guardianNumeric);
        if (guardianAcademy && guardianAcademy !== newAcademyId) {
          throw new Error('Responsável (guardian) pertence a outra academia.');
        }
      }
    }

    if (data?.cpf && newAcademyId) {
      if (
        await findCpfDuplicate({
          cpf: data.cpf,
          academyId: newAcademyId,
          excludeId: current.id,
        })
      ) {
        throw new Error(
          `Já existe um dependente com o CPF "${data.cpf}" nesta academia.`,
        );
      }
    }
  },
};
