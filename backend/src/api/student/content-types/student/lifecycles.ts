/**
 * Student lifecycle hooks.
 *
 * Enforces uniqueness of (academy, email) — Strapi's `email` field has no
 * built-in compound-unique constraint, so we check at the application layer.
 * Two academies CAN have a student with the same email (intended for SaaS),
 * but the same academy cannot have duplicates.
 *
 * Runs on every write path — GraphQL mutations AND the Strapi admin UI —
 * so defense-in-depth covers manual content-manager edits too.
 */

const UID = 'api::student.student';

async function findDuplicate(params: {
  email: string;
  academyId: number;
  excludeId?: number;
}): Promise<boolean> {
  const where: any = {
    email: params.email,
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
    if (!data?.email || !data?.academy) return;

    // Strapi v5 passes related-entity FK as the numeric id (or { id }).
    const academyId =
      typeof data.academy === 'number'
        ? data.academy
        : data.academy?.id ?? data.academy?.connect?.[0]?.id;
    if (!academyId) return;

    if (await findDuplicate({ email: data.email, academyId })) {
      throw new Error(
        `Já existe um aluno com o e-mail "${data.email}" nesta academia.`,
      );
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    if (!data?.email && !data?.academy) return;

    // Resolve the existing row to know which academy / id we're editing.
    const current: any = await strapi.db
      .query(UID)
      .findOne({ where, populate: { academy: { select: ['id'] } } });
    if (!current) return;

    const newEmail = data.email ?? current.email;
    const newAcademy =
      data.academy !== undefined
        ? typeof data.academy === 'number'
          ? data.academy
          : data.academy?.id ?? data.academy?.connect?.[0]?.id
        : current.academy?.id;

    if (!newEmail || !newAcademy) return;

    if (
      await findDuplicate({
        email: newEmail,
        academyId: newAcademy,
        excludeId: current.id,
      })
    ) {
      throw new Error(
        `Já existe um aluno com o e-mail "${newEmail}" nesta academia.`,
      );
    }
  },
};
