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

  const studentsSeed: Array<{
    name: string;
    email: string;
    phone: string;
    plan: any;
    role: 'academy_admin' | 'instructor' | 'member';
  }> = [
    { name: 'João Silva', email: 'joao@gym-demo.com', phone: '11 98888-1111', plan: planMensal, role: 'member' },
    // Ana is the demo academy_admin — the dev user (see ensureDemoDevUser)
    // logs in as her so /admin/* pages show full-CRUD affordances.
    { name: 'Ana Costa', email: 'ana@gym-demo.com', phone: '11 98888-2222', plan: planAnual, role: 'academy_admin' },
    { name: 'Carlos Souza', email: 'carlos@gym-demo.com', phone: '11 98888-3333', plan: planMensal, role: 'member' },
  ];

  for (const s of studentsSeed) {
    const student: any = await strapi.documents('api::student.student').create({
      data: {
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: 'active',
        role: s.role,
        academy: academy.documentId,
      } as any,
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

  // Mark Ana Costa as a guardian and attach two dependents.
  const anaResults: any = await strapi.documents('api::student.student').findMany({
    filters: { email: 'ana@gym-demo.com' },
    limit: 1,
  });
  const ana = anaResults[0];
  if (ana) {
    await strapi.documents('api::student.student').update({
      documentId: ana.documentId,
      data: { isGuardian: true } as any,
    });
    await strapi.documents('api::dependent.dependent').create({
      data: {
        name: 'Sofia Costa',
        birthdate: '2018-03-12',
        gender: 'girl',
        relationship: 'daughter',
        status: 'active',
        bloodType: 'A+',
        medicalAlert: 'Alergia a cloro — informar instrutor',
        emergencyContactName: 'Carlos Costa (pai)',
        emergencyContactPhone: '(11) 99999-1234',
        guardian: ana.documentId,
        academy: academy.documentId,
      } as any,
    });
    await strapi.documents('api::dependent.dependent').create({
      data: {
        name: 'Pedro Costa',
        birthdate: '2016-07-05',
        gender: 'boy',
        relationship: 'son',
        status: 'active',
        bloodType: 'O+',
        guardian: ana.documentId,
        academy: academy.documentId,
      } as any,
    });
  }

  // Sample expenses for April 2026 — matches the DRE page fixture.
  const today = new Date().toISOString().slice(0, 10);
  const expensesSeed = [
    {
      description: 'Aluguel — Abril',
      subtitle: 'Recorrente · Todo dia 5',
      amount: 4500,
      date: today,
      category: 'rent',
      type: 'fixed',
      status: 'paid',
      recurrent: true,
      recurrenceDay: 5,
    },
    {
      description: 'Folha de Pagamento',
      subtitle: '2 instrutores + 1 recepcionista',
      amount: 3000,
      date: today,
      category: 'payroll',
      type: 'fixed',
      status: 'paid',
    },
    {
      description: 'Google Ads — Abril',
      subtitle: 'Campanha matrícula nova turma',
      amount: 900,
      date: today,
      category: 'marketing',
      type: 'variable',
      status: 'pending',
    },
    {
      description: 'Conta de Luz',
      subtitle: 'CPFL — Referência Março/26',
      amount: 480,
      date: today,
      category: 'utilities',
      type: 'fixed',
      status: 'paid',
    },
    {
      description: 'Internet + Telefone',
      amount: 320,
      date: today,
      category: 'utilities',
      type: 'fixed',
      status: 'paid',
    },
    {
      description: 'Manutenção Esteira #3',
      subtitle: 'Técnico agendado',
      amount: 350,
      date: today,
      category: 'equipment',
      type: 'variable',
      status: 'open',
    },
  ];
  for (const e of expensesSeed) {
    await strapi.documents('api::expense.expense').create({
      data: { ...e, academy: academy.documentId } as any,
    });
  }

  strapi.log.info(
    '[seed] demo academy + 3 students (1 guardian w/ 2 dependents) + 2 plans + 2 schedules + 6 expenses created',
  );
}

/**
 * Ensures a ready-to-login dev user exists in the users-permissions
 * plugin and is linked to the demo academy admin Student (Ana Costa).
 *
 * Runs every bootstrap when SEED_DEMO=true so that a partially-seeded
 * DB (e.g. first-boot crashed before user creation) still converges
 * to a working login. Idempotent — looks up the user by email first.
 *
 * Creds are taken from env (DEV_USER_EMAIL / DEV_USER_PASSWORD) with
 * safe fallbacks so `SEED_DEMO=true npm run develop` on a fresh clone
 * just works. The console prints the credentials prominently so the
 * operator doesn't have to grep source.
 */
export async function ensureDemoDevUser(strapi: Core.Strapi) {
  const email = process.env.DEV_USER_EMAIL ?? 'admin@gym-demo.com';
  const password = process.env.DEV_USER_PASSWORD ?? 'gym-demo-admin';

  // Target Student (Ana Costa — academy_admin role) must exist.
  const studentResults: any = await strapi
    .documents('api::student.student')
    .findMany({
      filters: { email: 'ana@gym-demo.com' },
      populate: { user: true, academy: true },
      limit: 1,
    });
  const ana = studentResults[0];
  if (!ana) {
    strapi.log.warn(
      '[seed] ensureDemoDevUser: Ana Costa not seeded — skipping user',
    );
    return;
  }

  // Default Authenticated role — we do NOT create custom gym roles in
  // users-permissions anymore. Access is controlled via Student.role.
  const roles = await strapi
    .plugin('users-permissions')
    .service('role')
    .find();
  const authRole = roles.find(
    (r: any) => r.type === 'authenticated' || r.name === 'Authenticated',
  );
  if (!authRole) {
    strapi.log.warn(
      '[seed] ensureDemoDevUser: Authenticated role missing — skipping user',
    );
    return;
  }

  // Find-or-create the user.
  const existing = await strapi.db
    .query('plugin::users-permissions.user')
    .findOne({ where: { email } });

  let user: any = existing;
  if (existing) {
    strapi.log.info(`[seed] dev user ${email} already exists`);
  } else {
    user = await strapi
      .plugin('users-permissions')
      .service('user')
      .add({
        username: email,
        email,
        password,
        provider: 'local',
        role: authRole.id,
        confirmed: true,
        blocked: false,
      });
    strapi.log.info(`[seed] created dev user ${email}`);
  }

  // Link the user onto Ana's Student record and make sure she carries
  // the academy_admin role (the field was added after the demo data
  // was first seeded, so early DBs may still have her at the default).
  const needsUserLink = !ana.user || ana.user.id !== user.id;
  const needsRoleBackfill = ana.role !== 'academy_admin';
  if (needsUserLink || needsRoleBackfill) {
    await strapi.documents('api::student.student').update({
      documentId: ana.documentId,
      data: {
        ...(needsUserLink ? { user: user.id } : {}),
        ...(needsRoleBackfill ? { role: 'academy_admin' } : {}),
      } as any,
    });
    strapi.log.info(
      `[seed] Student "${ana.name}" updated (user=${needsUserLink}, role=${needsRoleBackfill})`,
    );
  }

  // Mirror the same credentials into Strapi's admin panel so operators
  // only memorise one pair for both :7777/admin and the website login.
  await ensureStrapiAdminUser(strapi, email, password);

  // Print the credentials prominently so the operator doesn't have to
  // grep source.
  const border = '═'.repeat(56);
  strapi.log.info(border);
  strapi.log.info('[seed] Dev login ready:');
  strapi.log.info(`          email:    ${email}`);
  strapi.log.info(`          password: ${password}`);
  strapi.log.info(`          academy:  ${ana.academy?.slug ?? 'gym-demo'}`);
  strapi.log.info(border);
}

/**
 * Ensures a Strapi admin-panel user (the /admin login, not the
 * users-permissions one above) exists with the given credentials. If
 * an admin with that email already exists, its password is reset so
 * the credentials printed in the log actually work. Always assigned
 * the super_admin role so the operator can walk the content manager.
 *
 * Idempotent: find-or-create, then reset password if needed.
 */
async function ensureStrapiAdminUser(
  strapi: Core.Strapi,
  email: string,
  password: string,
) {
  const roleService: any = strapi.service('admin::role');
  const userService: any = strapi.service('admin::user');
  const authService: any = strapi.service('admin::auth');

  const superAdminRole = await roleService.getSuperAdmin();
  if (!superAdminRole) {
    strapi.log.warn(
      '[seed] super-admin role not found — skipping admin user provisioning',
    );
    return;
  }

  const existing = await strapi.db
    .query('admin::user')
    .findOne({ where: { email } });

  if (existing) {
    // Reset password so the banner credentials always work, even if
    // someone rotated the password via the UI.
    const hashedPassword = await authService.hashPassword(password);
    await strapi.db.query('admin::user').update({
      where: { id: existing.id },
      data: {
        password: hashedPassword,
        isActive: true,
        blocked: false,
      },
    });
    strapi.log.info(`[seed] reset Strapi admin password for ${email}`);
    return;
  }

  await userService.create({
    firstname: 'Gym',
    lastname: 'Admin',
    email,
    password,
    isActive: true,
    blocked: false,
    roles: [superAdminRole.id],
  });
  strapi.log.info(`[seed] created Strapi admin ${email}`);
}
