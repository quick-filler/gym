/**
 * WorkoutPlan lifecycles (Fase 7b) — notify the roster on a new ficha/activity.
 *
 * On create, every student in the plan's roster (manyToMany `students`) gets a
 * "Nova ficha de treino" (or "Nova atividade de piscina" when category=pool).
 * Best-effort — never blocks the write.
 */

import { createInApp } from '../../../../services/notify';

const UID = 'api::workout-plan.workout-plan';

export default {
  async afterCreate(event: any) {
    const docId = event.result?.documentId;
    if (!docId) return;

    const plan: any = await strapi.documents(UID).findOne({
      documentId: docId,
      populate: { students: { populate: { user: true, academy: true } } },
    });
    if (!plan) return;

    const isPool = plan.category === 'pool';
    const title = isPool ? 'Nova atividade de piscina' : 'Nova ficha de treino';
    for (const s of plan.students ?? []) {
      if (s?.user?.id) {
        await createInApp(strapi, {
          userId: s.user.id,
          academyId: s.academy?.id ?? null,
          kind: 'workout_new',
          title,
          body: plan.name ?? '',
          data: { route: `/workout/${docId}`, workoutPlanId: docId },
        });
      }
    }
  },
};
