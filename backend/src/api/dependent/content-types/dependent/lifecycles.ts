/**
 * Dependent lifecycle hooks.
 *
 * Defense-in-depth: guardian (a Student) and dependent must belong to the
 * same Academy. Guardian validation also fires from the Strapi admin UI,
 * which bypasses the GraphQL resolver checks.
 */

const STUDENT = 'api::student.student';

function pickRelationId(value: any): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'object') {
    return value.id ?? value.connect?.[0]?.id ?? null;
  }
  return null;
}

async function academyOf(uid: string, id: number): Promise<number | null> {
  const row: any = await strapi.db.query(uid).findOne({
    where: { id },
    populate: { academy: { select: ['id'] } },
  });
  return row?.academy?.id ?? null;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    const guardianId = pickRelationId(data?.guardian);
    const academyId = pickRelationId(data?.academy);

    if (!guardianId || !academyId) return;

    const guardianAcademy = await academyOf(STUDENT, guardianId);
    if (guardianAcademy && guardianAcademy !== academyId) {
      throw new Error(
        'Responsável (guardian) pertence a outra academia.',
      );
    }
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;
    const guardianId = pickRelationId(data?.guardian);
    const academyId = pickRelationId(data?.academy);
    if (!guardianId || !academyId) return;

    const guardianAcademy = await academyOf(STUDENT, guardianId);
    if (guardianAcademy && guardianAcademy !== academyId) {
      throw new Error(
        'Responsável (guardian) pertence a outra academia.',
      );
    }
  },
};
