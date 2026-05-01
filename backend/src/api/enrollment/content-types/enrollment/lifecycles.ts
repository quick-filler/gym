/**
 * Enrollment lifecycle hooks.
 *
 * beforeCreate validates tenant integrity:
 *   - exactly one of (student, dependent)
 *   - student/dependent and plan must belong to the same Academy
 *
 * afterCreate: kick off Asaas customer + subscription provisioning.
 * afterUpdate: cancel Asaas subscription when status flips to 'cancelled'.
 *
 * External calls fire under setImmediate so the gateway never blocks the
 * triggering HTTP request.
 */

import { asaasForAcademy } from '../../../../services/asaas';

const ENROLLMENT = 'api::enrollment.enrollment';
const STUDENT = 'api::student.student';
const DEPENDENT = 'api::dependent.dependent';
const PLAN = 'api::plan.plan';

function pickRelationId(value: any): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'object') {
    return value.id ?? value.connect?.[0]?.id ?? null;
  }
  return null;
}

async function fetchAcademyId(uid: string, id: number): Promise<number | null> {
  const row: any = await strapi.db.query(uid).findOne({
    where: { id },
    populate: { academy: { select: ['id'] } },
  });
  return row?.academy?.id ?? null;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    const studentId = pickRelationId(data?.student);
    const dependentId = pickRelationId(data?.dependent);
    const planId = pickRelationId(data?.plan);

    if (!studentId && !dependentId) {
      throw new Error('Matrícula requer um aluno ou dependente.');
    }
    if (studentId && dependentId) {
      throw new Error(
        'Matrícula não pode ter aluno e dependente simultaneamente.',
      );
    }
    if (!planId) return;

    const planAcademy = await fetchAcademyId(PLAN, planId);
    const subjectAcademy = studentId
      ? await fetchAcademyId(STUDENT, studentId)
      : await fetchAcademyId(DEPENDENT, dependentId!);

    if (planAcademy && subjectAcademy && planAcademy !== subjectAcademy) {
      throw new Error(
        'Plano e aluno/dependente pertencem a academias diferentes.',
      );
    }
  },

  async afterCreate(event: any) {
    const { result } = event;

    setImmediate(async () => {
      try {
        const enrollment: any = await strapi.documents(ENROLLMENT).findOne({
          documentId: result.documentId,
          populate: {
            student: {
              fields: ['name', 'email', 'phone'],
              populate: { academy: { fields: ['documentId'] } },
            },
            dependent: {
              fields: ['name'],
              populate: { academy: { fields: ['documentId'] } },
            },
            plan: { fields: ['name', 'price', 'billingCycle'] },
          },
        });

        if (!enrollment?.plan || (!enrollment?.student && !enrollment?.dependent)) {
          strapi.log.warn(
            `[enrollment] skipping Asaas sync — missing relations for ${result.documentId}`,
          );
          return;
        }

        // Resolve the tenant's Asaas credentials. Dependents bill through
        // their guardian (Student), so we always need a Student to charge.
        const academyId =
          enrollment.student?.academy?.documentId ??
          enrollment.dependent?.academy?.documentId;
        const billingSubject = enrollment.student ?? enrollment.dependent;
        if (!billingSubject?.email && !billingSubject?.name) {
          strapi.log.warn(
            `[enrollment] skipping Asaas sync — missing billing identity for ${result.documentId}`,
          );
          return;
        }

        const asaas = await asaasForAcademy(academyId);
        const { customerId, subscriptionId } =
          await asaas.createCustomerAndSubscription({
            name: billingSubject.name,
            email: billingSubject.email ?? `${billingSubject.name}@no-email.local`,
            phone: billingSubject.phone,
            value: Number(enrollment.plan.price),
            billingType: mapBillingType(enrollment.paymentMethod),
            cycle: mapCycle(enrollment.plan.billingCycle),
            nextDueDate: enrollment.startDate,
            description: `${enrollment.plan.name} — ${billingSubject.name}`,
          });

        await strapi.documents(ENROLLMENT).update({
          documentId: result.documentId,
          data: {
            asaasCustomerId: customerId,
            asaasSubId: subscriptionId,
          },
        });

        strapi.log.info(`[enrollment] synced with Asaas: sub=${subscriptionId}`);
      } catch (err: any) {
        strapi.log.error(`[enrollment] Asaas sync failed: ${err.message}`);
      }
    });
  },

  async afterUpdate(event: any) {
    const { result } = event;
    if (result.status !== 'cancelled' || !result.asaasSubId) return;

    setImmediate(async () => {
      try {
        const enrollment: any = await strapi.documents(ENROLLMENT).findOne({
          documentId: result.documentId,
          populate: {
            student: { populate: { academy: { fields: ['documentId'] } } },
            dependent: { populate: { academy: { fields: ['documentId'] } } },
          },
        });
        const academyId =
          enrollment?.student?.academy?.documentId ??
          enrollment?.dependent?.academy?.documentId;
        const asaas = await asaasForAcademy(academyId);
        await asaas.cancelSubscription(result.asaasSubId);
        strapi.log.info(`[enrollment] Asaas subscription cancelled: ${result.asaasSubId}`);
      } catch (err: any) {
        strapi.log.error(`[enrollment] failed to cancel Asaas sub: ${err.message}`);
      }
    });
  },
};

type AsaasBillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';
type AsaasCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

function mapBillingType(method: string): AsaasBillingType {
  const m: Record<string, AsaasBillingType> = {
    pix: 'PIX',
    boleto: 'BOLETO',
    credit_card: 'CREDIT_CARD',
  };
  return m[method] ?? 'PIX';
}

function mapCycle(cycle: string): AsaasCycle {
  const m: Record<string, AsaasCycle> = {
    monthly: 'MONTHLY',
    quarterly: 'QUARTERLY',
    annual: 'YEARLY',
  };
  return m[cycle] ?? 'MONTHLY';
}
