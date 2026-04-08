/**
 * Bootstrap helper — seeds demo data on a fresh install.
 *
 * Idempotent: checks for the demo academy slug before creating anything.
 * Creates:
 *   - 1 academy "Gym Demo" (slug: gym-demo, indigo theme)
 *   - 2 plans (Mensal R$99, Anual R$890)
 *   - 3 students with active enrollments
 *   - 1 sample class schedule (Musculação Turma A)
 *   - 1 sample workout plan
 */

import type { Core } from '@strapi/strapi';

const DEMO_SLUG = 'gym-demo';

export async function seedDemoData(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::academy.academy').findMany({
    filters: { slug: DEMO_SLUG },
    limit: 1,
  });

  if (existing.length > 0) {
    strapi.log.info('[seed] demo academy already exists, skipping');
    return;
  }

  strapi.log.info('[seed] creating demo data...');

  const academy: any = await strapi.documents('api::academy.academy').create({
    data: {
      name: 'Gym Demo',
      slug: DEMO_SLUG,
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      plan: 'business',
      isActive: true,
      email: 'admin@gym-demo.com',
      phone: '+55 11 99999-0000',
      address: 'Rua das Academias, 100 — São Paulo, SP',
    },
  });

  const planMensal: any = await strapi.documents('api::plan.plan').create({
    data: {
      name: 'Mensal',
      description: 'Acesso completo à academia, renovado mensalmente.',
      price: 99,
      billingCycle: 'monthly',
      maxStudents: null,
      features: ['Acesso ilimitado', 'Aulas em grupo', 'Avaliação física trimestral'],
      isActive: true,
      academy: academy.documentId,
    },
  });

  const planAnual: any = await strapi.documents('api::plan.plan').create({
    data: {
      name: 'Anual',
      description: 'Pagamento à vista com 25% de desconto.',
      price: 890,
      billingCycle: 'annual',
      maxStudents: null,
      features: ['Acesso ilimitado', 'Aulas em grupo', 'Personal 1x/mês', 'Avaliação física mensal'],
      isActive: true,
      academy: academy.documentId,
    },
  });

  const studentsSeed = [
    { name: 'João Silva', email: 'joao@gym-demo.com', phone: '11 98888-1111', plan: planMensal },
    { name: 'Ana Costa', email: 'ana@gym-demo.com', phone: '11 98888-2222', plan: planAnual },
    { name: 'Carlos Souza', email: 'carlos@gym-demo.com', phone: '11 98888-3333', plan: planMensal },
  ];

  for (const s of studentsSeed) {
    const student: any = await strapi.documents('api::student.student').create({
      data: {
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: 'active',
        academy: academy.documentId,
      },
    });

    await strapi.documents('api::enrollment.enrollment').create({
      data: {
        student: student.documentId,
        plan: s.plan.documentId,
        startDate: new Date().toISOString().slice(0, 10),
        status: 'active',
        paymentMethod: 'pix',
      },
    });
  }

  // Sample workout for João
  const joaoResults: any = await strapi.documents('api::student.student').findMany({
    filters: { email: 'joao@gym-demo.com' },
    limit: 1,
  });
  const joao = joaoResults[0];

  if (joao) {
    await strapi.documents('api::workout-plan.workout-plan').create({
      data: {
        name: 'Treino A — Peito e Tríceps',
        student: joao.documentId,
        instructor: 'Rafael',
        exercises: [
          { name: 'Supino Reto', sets: 4, reps: 12, load: '60kg', notes: '' },
          { name: 'Crucifixo Inclinado', sets: 3, reps: 15, load: '16kg', notes: '' },
          { name: 'Tríceps Corda', sets: 4, reps: 12, load: '25kg', notes: '' },
        ],
        validFrom: new Date().toISOString().slice(0, 10),
        isActive: true,
      },
    });
  }

  // Sample class schedule
  await strapi.documents('api::class-schedule.class-schedule').create({
    data: {
      name: 'Musculação Turma A',
      instructor: 'Rafael',
      modality: 'presential',
      weekdays: [1, 3, 5], // Mon, Wed, Fri
      startTime: '06:00',
      endTime: '07:00',
      maxCapacity: 20,
      room: 'Sala 1',
      isActive: true,
      academy: academy.documentId,
    },
  });

  await strapi.documents('api::class-schedule.class-schedule').create({
    data: {
      name: 'Pilates Manhã',
      instructor: 'Beatriz',
      modality: 'presential',
      weekdays: [2, 4],
      startTime: '07:00',
      endTime: '08:00',
      maxCapacity: 12,
      room: 'Sala 2',
      isActive: true,
      academy: academy.documentId,
    },
  });

  strapi.log.info('[seed] demo academy + 3 students + 2 plans + 2 schedules created');
}
