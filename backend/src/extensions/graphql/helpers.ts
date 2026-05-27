/**
 * Shared helpers for explicit GraphQL resolvers.
 *
 * The schema uses Strapi's documentId as the canonical GraphQL ID and never
 * exposes the numeric primary key. These helpers centralize tenancy /
 * authorization for the multi-tenant SaaS:
 *
 *   - resolveUserAcademyId  → academia do caller (null se não vinculado)
 *   - resolveUserRole       → papel (academy_admin / instructor / member)
 *   - isPlatformAdmin       → super-admin da plataforma (cross-academy)
 *   - requireAcademyId      → garante caller com academia (write paths)
 *   - requireRole           → garante papel mínimo
 *   - resolveDocAcademyId   → descobre a academia de um documento qualquer
 *   - assertCanAccessDoc    → garante que o doc é da academia do caller
 *   - withAcademyScope      → filtros para entidades com academy direto
 *   - withPaymentScope      → filtros para Payment (3-hop)
 *   - withStudentScope      → filtros para Enrollment / WorkoutPlan / etc.
 *   - withBookingScope      → filtros para ClassBooking
 */

import type { Core } from '@strapi/strapi';

const PLATFORM_ADMIN = 'api::platform-admin.platform-admin';
const STUDENT = 'api::student.student';

// Sentinel that never matches a real documentId. Used to neutralize filters
// when the caller has no academy linked — falling back to "no rows" instead
// of "all rows" is the safe default for a multi-tenant SaaS.
const NO_ACADEMY = '__none__';

export type UserRole = 'academy_admin' | 'instructor' | 'member';

// ─────────────────────────────────────────────────────────────────────────────
// Caller identity
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the academyId of the authenticated caller, if they're linked to
 * a Student record. Returns null for unauthenticated requests and for users
 * without a Student row (typically platform admins or misconfigured users).
 */
export async function resolveUserAcademyId(
  strapi: Core.Strapi,
  ctx: any,
): Promise<string | null> {
  const userId = ctx?.state?.user?.id;
  if (!userId) return null;

  const students: any[] = await strapi.documents(STUDENT).findMany({
    filters: { user: { id: userId } },
    populate: { academy: { fields: ['documentId'] } },
    limit: 1,
  });

  return students[0]?.academy?.documentId ?? null;
}

/**
 * Returns the caller's gym role, derived from their linked Student.
 * Null when the user has no Student record.
 */
export async function resolveUserRole(
  strapi: Core.Strapi,
  ctx: any,
): Promise<UserRole | null> {
  const userId = ctx?.state?.user?.id;
  if (!userId) return null;

  const students: any[] = await strapi.documents(STUDENT).findMany({
    filters: { user: { id: userId } },
    fields: ['role'],
    limit: 1,
  });

  return (students[0]?.role as UserRole) ?? null;
}

/**
 * True when the caller is a platform-level super admin (cross-academy access).
 */
export async function isPlatformAdmin(
  strapi: Core.Strapi,
  ctx: any,
): Promise<boolean> {
  const userId = ctx?.state?.user?.id;
  if (!userId) return false;
  const records = await strapi.documents(PLATFORM_ADMIN).findMany({
    filters: { user: { id: userId } },
    limit: 1,
  });
  return records.length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Guards (write paths)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Throws a user-visible error when the caller has no linked academy.
 * Use in write resolvers to prevent orphaned records.
 */
export async function requireAcademyId(
  strapi: Core.Strapi,
  ctx: any,
): Promise<string> {
  const academyId = await resolveUserAcademyId(strapi, ctx);
  if (!academyId) {
    throw new Error(
      'Sua conta não está vinculada a nenhuma academia. ' +
        'Use o comando admin:create para configurar o acesso ou ' +
        'peça ao administrador da plataforma para vincular sua conta.',
    );
  }
  return academyId;
}

/**
 * Throws when the caller's role is not in the allowed list. Platform admins
 * bypass this check. Pass roles like ['academy_admin'] or
 * ['academy_admin', 'instructor'].
 */
export async function requireRole(
  strapi: Core.Strapi,
  ctx: any,
  allowed: UserRole[],
): Promise<UserRole> {
  if (await isPlatformAdmin(strapi, ctx)) return 'academy_admin';
  const role = await resolveUserRole(strapi, ctx);
  if (!role || !allowed.includes(role)) {
    throw new Error(
      `Acesso negado: ação restrita a ${allowed.join(' / ')}.`,
    );
  }
  return role;
}

const SUBSCRIPTION_UID =
  'api::academy-subscription.academy-subscription' as any;

// Status que liberam escrita. Tudo fora dessa lista (expired, past_due,
// cancelled, ou subscription ausente) bloqueia mutations CRUD.
const WRITE_ALLOWED_STATUSES = new Set(['trialing', 'active']);

/**
 * Guard das mutations de "real work" (criar/editar/deletar Students,
 * Enrollments, Payments, Plans, etc.). Recusa se a subscription da
 * academia do caller estiver em estado que não permite escrita:
 *
 *   - `expired`       (trial venceu sem upgrade)
 *   - `cancelled`     (admin cancelou)
 *   - `past_due`      (pagamento falhou, aguardando regularização)
 *   - subscription ausente (não deveria acontecer pós-backfill)
 *
 * Platform admin bypassa (precisa poder consertar academias com sub
 * ruim). Caller sem academia vinculada também bypassa — esse caso
 * já é gateado por `requireAcademyId` quando relevante.
 *
 * Mensagem do erro é user-friendly porque ela sobe até o toast no
 * frontend. Inclui o `status` pra o UI poder ramificar (já vem do
 * `mySubscription` query também, então frontend pode pré-bloquear).
 */
export async function requireActiveSubscription(
  strapi: Core.Strapi,
  ctx: any,
): Promise<void> {
  if (await isPlatformAdmin(strapi, ctx)) return;

  const academyId = await resolveUserAcademyId(strapi, ctx);
  if (!academyId) return; // outras guards (requireAcademyId) tratam

  const rows: any[] = await strapi.documents(SUBSCRIPTION_UID).findMany({
    filters: { academy: { documentId: academyId } } as any,
    fields: ['status', 'trialEndsAt'] as any,
    limit: 1,
  });
  const sub = rows[0];

  // Sem sub: bloqueia escrita. Lifecycle + backfill cobrem 100% das
  // academias em produção; cair aqui significa estado corrompido.
  if (!sub) {
    throw new Error(
      'Sua academia não tem uma assinatura ativa. Acesse /admin/billing pra ativar.',
    );
  }

  if (!WRITE_ALLOWED_STATUSES.has(sub.status)) {
    const messageByStatus: Record<string, string> = {
      expired:
        'Seu período de teste expirou. Escolha um plano em /admin/billing pra continuar.',
      cancelled:
        'Sua assinatura está cancelada. Reative em /admin/billing pra voltar a operar.',
      past_due:
        'Sua assinatura está com pagamento em atraso. Regularize em /admin/billing.',
    };
    throw new Error(
      messageByStatus[sub.status] ??
        `Sua assinatura está em estado "${sub.status}" e não permite alterações.`,
    );
  }

  // Defesa extra: subscription `trialing` mas trialEndsAt no passado.
  // Não deveria ocorrer (cron flipa pra `expired`), mas se ocorrer
  // tratamos como expirado pra evitar acesso pós-trial gratuito.
  if (
    sub.status === 'trialing' &&
    sub.trialEndsAt &&
    new Date(sub.trialEndsAt).getTime() < Date.now()
  ) {
    throw new Error(
      'Seu período de teste expirou. Escolha um plano em /admin/billing pra continuar.',
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Document ownership
// ─────────────────────────────────────────────────────────────────────────────

type EntityUID =
  | 'api::academy.academy'
  | 'api::academy-subscription.academy-subscription'
  | 'api::student.student'
  | 'api::plan.plan'
  | 'api::platform-plan.platform-plan'
  | 'api::class-schedule.class-schedule'
  | 'api::expense.expense'
  | 'api::dependent.dependent'
  | 'api::enrollment.enrollment'
  | 'api::payment.payment'
  | 'api::workout-plan.workout-plan'
  | 'api::body-assessment.body-assessment'
  | 'api::class-booking.class-booking';

/**
 * Walks each entity's relation chain to find the academy it belongs to.
 * Returns null if the document doesn't exist or has no resolvable academy.
 *
 * Centralizing the path here lets every resolver call assertCanAccessDoc
 * without knowing the relation graph itself.
 */
export async function resolveDocAcademyId(
  strapi: Core.Strapi,
  uid: EntityUID,
  documentId: string,
): Promise<string | null> {
  if (uid === 'api::academy.academy') return documentId;
  // PlatformPlan é cross-tenant (não pertence a academia nenhuma).
  // Retorna null pra qualquer assertCanAccessDoc rejeitar como
  // "documento de outra academia" — guards reais ficam nos resolvers
  // do platform-plan.ts (gated por isPlatformAdmin).
  if (uid === 'api::platform-plan.platform-plan') return null;
  // AcademySubscription pertence a uma academia via relação `academy`
  // (1:1). Resolvemos populando essa relação.
  if (uid === 'api::academy-subscription.academy-subscription') {
    const doc: any = await strapi.documents(uid as any).findOne({
      documentId,
      populate: { academy: { fields: ['documentId'] } } as any,
    });
    return doc?.academy?.documentId ?? null;
  }

  const populate: any = (() => {
    switch (uid) {
      case 'api::student.student':
      case 'api::plan.plan':
      case 'api::class-schedule.class-schedule':
      case 'api::expense.expense':
      case 'api::dependent.dependent':
        return { academy: { fields: ['documentId'] } };
      case 'api::enrollment.enrollment':
        return {
          student: { populate: { academy: { fields: ['documentId'] } } },
          dependent: { populate: { academy: { fields: ['documentId'] } } },
        };
      case 'api::payment.payment':
        return {
          enrollment: {
            populate: {
              student: { populate: { academy: { fields: ['documentId'] } } },
              dependent: { populate: { academy: { fields: ['documentId'] } } },
            },
          },
          // Cobranças avulsas (sem matrícula) podem apontar direto pro
          // aluno ou dependente.
          student: { populate: { academy: { fields: ['documentId'] } } },
          dependent: { populate: { academy: { fields: ['documentId'] } } },
        };
      case 'api::workout-plan.workout-plan':
      case 'api::body-assessment.body-assessment':
        return {
          student: { populate: { academy: { fields: ['documentId'] } } },
          dependent: { populate: { academy: { fields: ['documentId'] } } },
        };
      case 'api::class-booking.class-booking':
        return {
          student: { populate: { academy: { fields: ['documentId'] } } },
          dependent: { populate: { academy: { fields: ['documentId'] } } },
          classSchedule: {
            populate: { academy: { fields: ['documentId'] } },
          },
        };
    }
  })();

  const doc: any = await strapi
    .documents(uid)
    .findOne({ documentId, populate });

  if (!doc) return null;

  switch (uid) {
    case 'api::student.student':
    case 'api::plan.plan':
    case 'api::class-schedule.class-schedule':
    case 'api::expense.expense':
    case 'api::dependent.dependent':
      return doc.academy?.documentId ?? null;
    case 'api::enrollment.enrollment':
      return (
        doc.student?.academy?.documentId ??
        doc.dependent?.academy?.documentId ??
        null
      );
    case 'api::payment.payment': {
      const enr = doc.enrollment;
      return (
        enr?.student?.academy?.documentId ??
        enr?.dependent?.academy?.documentId ??
        doc.student?.academy?.documentId ??
        doc.dependent?.academy?.documentId ??
        null
      );
    }
    case 'api::workout-plan.workout-plan':
    case 'api::body-assessment.body-assessment':
      return (
        doc.student?.academy?.documentId ??
        doc.dependent?.academy?.documentId ??
        null
      );
    case 'api::class-booking.class-booking':
      return (
        doc.student?.academy?.documentId ??
        doc.dependent?.academy?.documentId ??
        doc.classSchedule?.academy?.documentId ??
        null
      );
  }
}

/**
 * Throws unless the document belongs to the caller's academy. Platform
 * admins bypass the check. Use before any single-document read / update /
 * delete to prevent cross-tenant access via documentId guessing.
 *
 * Returns the resolved academyId (the caller's, == doc's) so the caller
 * doesn't need to look it up again.
 */
export async function assertCanAccessDoc(
  strapi: Core.Strapi,
  ctx: any,
  uid: EntityUID,
  documentId: string,
): Promise<string> {
  if (await isPlatformAdmin(strapi, ctx)) {
    const docAcademy = await resolveDocAcademyId(strapi, uid, documentId);
    if (!docAcademy) throw new Error('Documento não encontrado.');
    return docAcademy;
  }

  const userAcademy = await resolveUserAcademyId(strapi, ctx);
  if (!userAcademy) {
    throw new Error('Acesso negado: usuário sem academia vinculada.');
  }
  const docAcademy = await resolveDocAcademyId(strapi, uid, documentId);
  if (!docAcademy) throw new Error('Documento não encontrado.');
  if (docAcademy !== userAcademy) {
    throw new Error('Acesso negado: documento de outra academia.');
  }
  return userAcademy;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter scopes (list queries)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scopes filters by direct academy relation. Use for entities that have
 * `academy` field directly (Student, Plan, ClassSchedule, Expense, Dependent).
 */
export function withAcademyScope(filters: any, academyId: string | null): any {
  return { ...filters, academy: { documentId: academyId ?? NO_ACADEMY } };
}

/**
 * Scopes Payment queries via enrollment → student/dependent → academy.
 * Both branches checked because an enrollment may belong to a Student OR
 * to a Dependent (whose payments are still funnelled through their guardian).
 *
 * Cobranças avulsas (sem matrícula) podem apontar direto pro aluno ou
 * dependente — por isso os dois últimos braços do $or.
 */
export function withPaymentScope(academyId: string | null): any {
  const id = academyId ?? NO_ACADEMY;
  return {
    $or: [
      { enrollment: { student: { academy: { documentId: id } } } },
      { enrollment: { dependent: { academy: { documentId: id } } } },
      { student: { academy: { documentId: id } } },
      { dependent: { academy: { documentId: id } } },
    ],
  };
}

/**
 * Scopes queries via student/dependent → academy. Use for Enrollment,
 * WorkoutPlan, BodyAssessment.
 */
export function withStudentScope(
  filters: any,
  academyId: string | null,
): any {
  const id = academyId ?? NO_ACADEMY;
  return {
    ...filters,
    $or: [
      { student: { academy: { documentId: id } } },
      { dependent: { academy: { documentId: id } } },
    ],
  };
}

/**
 * Scopes ClassBooking queries — booking can belong to a student or dependent,
 * and the classSchedule itself is also tied to an academy.
 */
export function withBookingScope(
  filters: any,
  academyId: string | null,
): any {
  const id = academyId ?? NO_ACADEMY;
  return {
    ...filters,
    $or: [
      { student: { academy: { documentId: id } } },
      { dependent: { academy: { documentId: id } } },
      { classSchedule: { academy: { documentId: id } } },
    ],
  };
}
