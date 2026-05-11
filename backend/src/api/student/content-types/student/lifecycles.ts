/**
 * Student lifecycle hooks.
 *
 * Enforces uniqueness of (academy, email) AND (academy, cpf) — Strapi's
 * `email`/`cpf` fields have no built-in compound-unique constraint, so we
 * check at the application layer. Two academies CAN have a student with
 * the same email or CPF (intended for SaaS — uma pessoa pode treinar em
 * academias diferentes), but the same academy cannot have duplicates.
 *
 * Runs on every write path — GraphQL mutations AND the Strapi admin UI —
 * so defense-in-depth covers manual content-manager edits too.
 */

import { pickRelationId, resolveNumericId } from '../../../../utils/relation';

const UID = 'api::student.student';
const ACADEMY = 'api::academy.academy';

type DupField = 'email' | 'cpf';

async function findDuplicate(params: {
  field: DupField;
  value: string;
  academyId: number;
  excludeId?: number;
}): Promise<boolean> {
  const where: any = {
    [params.field]: params.value,
    academy: { id: params.academyId },
  };
  if (params.excludeId) where.id = { $ne: params.excludeId };

  const existing = await strapi.db
    .query(UID)
    .findOne({ where, select: ['id'] });
  return !!existing;
}

const LABELS: Record<DupField, string> = {
  email: 'e-mail',
  cpf: 'CPF',
};

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    if (!data?.academy) return;
    const academyRef = pickRelationId(data.academy);
    const academyId = await resolveNumericId(ACADEMY, academyRef);
    if (!academyId) return;

    for (const field of ['email', 'cpf'] as const) {
      const value = data?.[field];
      if (!value) continue;
      if (await findDuplicate({ field, value, academyId })) {
        throw new Error(
          `Já existe um aluno com o ${LABELS[field]} "${value}" nesta academia.`,
        );
      }
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    if (!data?.email && !data?.cpf && !data?.academy) return;

    // Resolve the existing row to know which academy / id we're editing.
    const current: any = await strapi.db
      .query(UID)
      .findOne({ where, populate: { academy: { select: ['id'] } } });
    if (!current) return;

    const newAcademyId =
      data.academy !== undefined
        ? await resolveNumericId(ACADEMY, pickRelationId(data.academy))
        : current.academy?.id;
    if (!newAcademyId) return;

    for (const field of ['email', 'cpf'] as const) {
      const value = data?.[field] ?? current[field];
      if (!value) continue;
      if (
        await findDuplicate({
          field,
          value,
          academyId: newAcademyId,
          excludeId: current.id,
        })
      ) {
        throw new Error(
          `Já existe um aluno com o ${LABELS[field]} "${value}" nesta academia.`,
        );
      }
    }
  },
};
