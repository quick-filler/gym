/**
 * Mock fixtures powering demo mode. Shapes match src/lib/types.ts.
 *
 * The academy identity matches the `Gym Demo` seed produced by the
 * backend (`SEED_DEMO=true`), so switching to API mode against a
 * freshly seeded backend shows the same data set without code
 * changes in consuming pages.
 */

import type {
  AcademySettings,
  DREData,
  DashboardData,
  FinanceData,
  GuardianFamily,
  PricingPlan,
  ScheduleData,
  StudentRow,
  WorkoutsData,
} from "./types";

/* ============================================================
   Marketing
   ============================================================ */

export const MOCK_PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tag: "Para começar",
    priceMonthly: 99,
    priceAnnual: 79,
    tagline: "Para quem está começando",
    features: [
      "Até 50 alunos ativos",
      "Agenda + reservas",
      "Cobrança via PIX e boleto",
      "App white-label",
      "Suporte por e-mail",
    ],
    ctaLabel: "Começar grátis",
  },
  {
    id: "business",
    name: "Business",
    tag: "Mais escolhido",
    priceMonthly: 199,
    priceAnnual: 159,
    tagline: "Para crescer com confiança",
    features: [
      "Até 200 alunos ativos",
      "Tudo do Starter",
      "Cartão de crédito recorrente",
      "Relatórios financeiros",
      "Cobrança automática de inadimplentes",
      "Suporte WhatsApp prioritário",
    ],
    featured: true,
    ctaLabel: "Começar grátis",
  },
  {
    id: "pro",
    name: "Pro",
    tag: "Multi-unidade",
    priceMonthly: 399,
    priceAnnual: 319,
    tagline: "Para academias com várias unidades",
    features: [
      "Alunos ilimitados",
      "Tudo do Business",
      "Multi-unidade",
      "CRM integrado",
      "API + webhooks",
      "Gerente de conta dedicado",
    ],
    ctaLabel: "Falar com vendas",
  },
];

/* ============================================================
   Admin — dashboard
   ============================================================ */

export const MOCK_DASHBOARD: DashboardData = {
  metrics: [
    {
      id: "students",
      label: "Alunos ativos",
      value: "248",
      delta: { value: "+12", trend: "up" },
    },
    {
      id: "mrr",
      label: "Receita do mês",
      value: "R$ 62.480",
      delta: { value: "+8,2%", trend: "up" },
    },
    {
      id: "overdue",
      label: "Em atraso",
      value: "R$ 4.320",
      delta: { value: "-2,1%", trend: "down" },
    },
    {
      id: "classes",
      label: "Aulas hoje",
      value: "14",
      delta: { value: "86% cheias", trend: "flat" },
    },
  ],
  recentStudents: [
    {
      id: "s1",
      name: "Ana Beatriz Souza",
      email: "ana.souza@email.com",
      plan: "Mensal",
      status: "active",
      initials: "AB",
      avatarColor: "#e8551c",
      joinedAt: "02/04/2026",
    },
    {
      id: "s2",
      name: "Bruno Carvalho",
      email: "bruno.c@email.com",
      plan: "Trimestral",
      status: "active",
      initials: "BC",
      avatarColor: "#0f766e",
      joinedAt: "29/03/2026",
    },
    {
      id: "s3",
      name: "Camila Duarte",
      email: "cami.duarte@email.com",
      plan: "Anual",
      status: "active",
      initials: "CD",
      avatarColor: "#0369a1",
      joinedAt: "27/03/2026",
    },
    {
      id: "s4",
      name: "Diego Farias",
      email: "diego.f@email.com",
      plan: "Mensal",
      status: "suspended",
      initials: "DF",
      avatarColor: "#be123c",
      joinedAt: "18/03/2026",
    },
    {
      id: "s5",
      name: "Eduarda Gomes",
      email: "eduarda.g@email.com",
      plan: "Mensal",
      status: "active",
      initials: "EG",
      avatarColor: "#d97706",
      joinedAt: "12/03/2026",
    },
  ],
  todayClasses: [
    {
      id: "c1",
      name: "CrossFit — Turma 06h",
      instructor: "Carol M.",
      time: "06:00",
      booked: 18,
      capacity: 20,
    },
    {
      id: "c2",
      name: "Musculação livre",
      instructor: "Rafael P.",
      time: "08:00",
      booked: 24,
      capacity: 30,
    },
    {
      id: "c3",
      name: "Yoga flow",
      instructor: "Laura B.",
      time: "18:30",
      booked: 12,
      capacity: 14,
    },
    {
      id: "c4",
      name: "HIIT — Intermediário",
      instructor: "Guilherme S.",
      time: "19:30",
      booked: 19,
      capacity: 22,
    },
  ],
  upcomingPayments: [
    {
      id: "p1",
      student: "Ana Beatriz Souza",
      amount: "R$ 149,00",
      dueDate: "10/04/2026",
      method: "pix",
    },
    {
      id: "p2",
      student: "Bruno Carvalho",
      amount: "R$ 399,00",
      dueDate: "10/04/2026",
      method: "credit_card",
    },
    {
      id: "p3",
      student: "Camila Duarte",
      amount: "R$ 1.499,00",
      dueDate: "12/04/2026",
      method: "boleto",
    },
  ],
};

/* ============================================================
   Admin — students
   ============================================================ */

export const MOCK_STUDENTS: StudentRow[] = [
  {
    id: "s1",
    name: "Ana Beatriz Souza",
    email: "ana.souza@email.com",
    phone: "(11) 98201-0132",
    plan: "Mensal",
    planPrice: "R$ 149,00",
    status: "active",
    paymentMethod: "pix",
    joinedAt: "02/04/2026",
    nextPayment: "02/05/2026",
    initials: "AB",
    avatarColor: "#e8551c",
  },
  {
    id: "s2",
    name: "Bruno Carvalho",
    email: "bruno.c@email.com",
    phone: "(11) 97721-4411",
    plan: "Trimestral",
    planPrice: "R$ 399,00",
    status: "active",
    paymentMethod: "credit_card",
    joinedAt: "29/03/2026",
    nextPayment: "29/06/2026",
    initials: "BC",
    avatarColor: "#0f766e",
  },
  {
    id: "s3",
    name: "Camila Duarte",
    email: "cami.duarte@email.com",
    phone: "(11) 99540-8812",
    plan: "Anual",
    planPrice: "R$ 1.499,00",
    status: "active",
    paymentMethod: "boleto",
    joinedAt: "27/03/2026",
    nextPayment: "27/03/2027",
    initials: "CD",
    avatarColor: "#0369a1",
  },
  {
    id: "s4",
    name: "Diego Farias",
    email: "diego.f@email.com",
    phone: "(21) 98012-7731",
    plan: "Mensal",
    planPrice: "R$ 149,00",
    status: "suspended",
    paymentMethod: "pix",
    joinedAt: "18/03/2026",
    nextPayment: "18/04/2026",
    initials: "DF",
    avatarColor: "#be123c",
  },
  {
    id: "s5",
    name: "Eduarda Gomes",
    email: "eduarda.g@email.com",
    phone: "(11) 96620-5541",
    plan: "Mensal",
    planPrice: "R$ 149,00",
    status: "active",
    paymentMethod: "pix",
    joinedAt: "12/03/2026",
    nextPayment: "12/04/2026",
    initials: "EG",
    avatarColor: "#d97706",
  },
  {
    id: "s6",
    name: "Fernando Henrique Lima",
    email: "fernando.h@email.com",
    phone: "(11) 99001-3322",
    plan: "Trimestral",
    planPrice: "R$ 399,00",
    status: "active",
    paymentMethod: "credit_card",
    joinedAt: "01/03/2026",
    nextPayment: "01/06/2026",
    initials: "FL",
    avatarColor: "#059669",
  },
  {
    id: "s7",
    name: "Gabriela Ito",
    email: "gabi.ito@email.com",
    phone: "(11) 98544-2103",
    plan: "Anual",
    planPrice: "R$ 1.499,00",
    status: "active",
    paymentMethod: "credit_card",
    joinedAt: "22/02/2026",
    nextPayment: "22/02/2027",
    initials: "GI",
    avatarColor: "#e8551c",
  },
  {
    id: "s8",
    name: "Heitor Jorge",
    email: "heitor.j@email.com",
    phone: "(21) 97833-5508",
    plan: "Mensal",
    planPrice: "R$ 149,00",
    status: "inactive",
    paymentMethod: "pix",
    joinedAt: "18/02/2026",
    nextPayment: "-",
    initials: "HJ",
    avatarColor: "#44403c",
  },
];

/* ============================================================
   Admin — finance
   ============================================================ */

export const MOCK_FINANCE: FinanceData = {
  kpis: [
    {
      id: "revenue",
      label: "Receita do mês",
      value: "R$ 62.480,00",
      delta: { value: "+8,2% vs mês anterior", trend: "up" },
      highlighted: true,
    },
    {
      id: "overdue",
      label: "Em atraso",
      value: "R$ 4.320,00",
      delta: { value: "11 cobranças", trend: "down" },
    },
    {
      id: "processed",
      label: "Processado hoje",
      value: "R$ 8.211,00",
      delta: { value: "34 pagamentos", trend: "up" },
    },
    {
      id: "projection",
      label: "Projeção abril",
      value: "R$ 68.400,00",
      delta: { value: "+3,8% vs março", trend: "up" },
    },
  ],
  charges: [
    {
      id: "c1",
      student: "Ana Beatriz Souza",
      studentInitials: "AB",
      amount: 149,
      amountFormatted: "R$ 149,00",
      method: "pix",
      status: "paid",
      dueDate: "02/04/2026",
      paidAt: "02/04/2026",
    },
    {
      id: "c2",
      student: "Bruno Carvalho",
      studentInitials: "BC",
      amount: 399,
      amountFormatted: "R$ 399,00",
      method: "credit_card",
      status: "paid",
      dueDate: "29/03/2026",
      paidAt: "29/03/2026",
    },
    {
      id: "c3",
      student: "Camila Duarte",
      studentInitials: "CD",
      amount: 1499,
      amountFormatted: "R$ 1.499,00",
      method: "boleto",
      status: "pending",
      dueDate: "12/04/2026",
    },
    {
      id: "c4",
      student: "Diego Farias",
      studentInitials: "DF",
      amount: 149,
      amountFormatted: "R$ 149,00",
      method: "pix",
      status: "overdue",
      dueDate: "18/03/2026",
    },
    {
      id: "c5",
      student: "Eduarda Gomes",
      studentInitials: "EG",
      amount: 149,
      amountFormatted: "R$ 149,00",
      method: "pix",
      status: "paid",
      dueDate: "12/03/2026",
      paidAt: "12/03/2026",
    },
    {
      id: "c6",
      student: "Fernando Henrique Lima",
      studentInitials: "FL",
      amount: 399,
      amountFormatted: "R$ 399,00",
      method: "credit_card",
      status: "pending",
      dueDate: "10/04/2026",
    },
    {
      id: "c7",
      student: "Gabriela Ito",
      studentInitials: "GI",
      amount: 1499,
      amountFormatted: "R$ 1.499,00",
      method: "credit_card",
      status: "paid",
      dueDate: "22/02/2026",
      paidAt: "22/02/2026",
    },
  ],
  methodBreakdown: [
    { method: "pix", label: "PIX", amount: "R$ 34.520,00", percent: 55 },
    {
      method: "credit_card",
      label: "Cartão de crédito",
      amount: "R$ 21.610,00",
      percent: 35,
    },
    {
      method: "boleto",
      label: "Boleto",
      amount: "R$ 6.350,00",
      percent: 10,
    },
  ],
};

/* ============================================================
   Admin — schedule
   ============================================================ */

export const MOCK_SCHEDULE: ScheduleData = {
  weekLabel: "06 – 12 de abril, 2026",
  weekNumber: 15,
  stats: {
    totalClasses: 42,
    totalBookings: 612,
    capacityFill: 84,
  },
  upcoming: [
    { id: "u1", name: "CrossFit 06h", time: "Hoje, 06:00", instructor: "Carol M." },
    { id: "u2", name: "Musculação livre", time: "Hoje, 08:00", instructor: "Rafael P." },
    { id: "u3", name: "Yoga flow", time: "Hoje, 18:30", instructor: "Laura B." },
    { id: "u4", name: "HIIT intermediário", time: "Hoje, 19:30", instructor: "Guilherme S." },
  ],
  classes: [
    // Monday (1)
    { id: "m1", name: "CrossFit 06h", instructor: "Carol M.", weekday: 1, startTime: "06:00", endTime: "07:00", booked: 18, capacity: 20, color: "flame" },
    { id: "m2", name: "Musculação", instructor: "Rafael P.", weekday: 1, startTime: "08:00", endTime: "10:00", booked: 24, capacity: 30, color: "ink" },
    { id: "m3", name: "Yoga flow", instructor: "Laura B.", weekday: 1, startTime: "18:30", endTime: "19:30", booked: 12, capacity: 14, color: "pine" },
    { id: "m4", name: "HIIT", instructor: "Guilherme S.", weekday: 1, startTime: "19:30", endTime: "20:30", booked: 19, capacity: 22, color: "flame" },

    // Tuesday (2)
    { id: "t1", name: "CrossFit 06h", instructor: "Carol M.", weekday: 2, startTime: "06:00", endTime: "07:00", booked: 20, capacity: 20, color: "flame" },
    { id: "t2", name: "Musculação", instructor: "Rafael P.", weekday: 2, startTime: "08:00", endTime: "10:00", booked: 22, capacity: 30, color: "ink" },
    { id: "t3", name: "Funcional", instructor: "Pedro A.", weekday: 2, startTime: "17:00", endTime: "18:00", booked: 14, capacity: 18, color: "pine" },
    { id: "t4", name: "HIIT", instructor: "Guilherme S.", weekday: 2, startTime: "19:30", endTime: "20:30", booked: 20, capacity: 22, color: "flame" },

    // Wednesday (3)
    { id: "w1", name: "CrossFit 06h", instructor: "Carol M.", weekday: 3, startTime: "06:00", endTime: "07:00", booked: 17, capacity: 20, color: "flame" },
    { id: "w2", name: "Musculação", instructor: "Rafael P.", weekday: 3, startTime: "08:00", endTime: "10:00", booked: 26, capacity: 30, color: "ink" },
    { id: "w3", name: "Yoga flow", instructor: "Laura B.", weekday: 3, startTime: "18:30", endTime: "19:30", booked: 13, capacity: 14, color: "pine" },

    // Thursday (4)
    { id: "th1", name: "CrossFit 06h", instructor: "Carol M.", weekday: 4, startTime: "06:00", endTime: "07:00", booked: 19, capacity: 20, color: "flame" },
    { id: "th2", name: "Musculação", instructor: "Rafael P.", weekday: 4, startTime: "08:00", endTime: "10:00", booked: 24, capacity: 30, color: "ink" },
    { id: "th3", name: "Funcional", instructor: "Pedro A.", weekday: 4, startTime: "17:00", endTime: "18:00", booked: 16, capacity: 18, color: "pine" },
    { id: "th4", name: "HIIT", instructor: "Guilherme S.", weekday: 4, startTime: "19:30", endTime: "20:30", booked: 21, capacity: 22, color: "flame" },

    // Friday (5)
    { id: "f1", name: "CrossFit 06h", instructor: "Carol M.", weekday: 5, startTime: "06:00", endTime: "07:00", booked: 18, capacity: 20, color: "flame" },
    { id: "f2", name: "Musculação", instructor: "Rafael P.", weekday: 5, startTime: "08:00", endTime: "10:00", booked: 23, capacity: 30, color: "ink" },
    { id: "f3", name: "Yoga flow", instructor: "Laura B.", weekday: 5, startTime: "18:30", endTime: "19:30", booked: 14, capacity: 14, color: "pine" },

    // Saturday (6)
    { id: "sa1", name: "Open gym", instructor: "Rafael P.", weekday: 6, startTime: "09:00", endTime: "12:00", booked: 30, capacity: 40, color: "ink" },
    { id: "sa2", name: "CrossFit comp.", instructor: "Carol M.", weekday: 6, startTime: "10:00", endTime: "11:30", booked: 16, capacity: 18, color: "flame" },
  ],
};

/* ============================================================
   Admin — settings / white-label identity
   ============================================================ */

export const MOCK_ACADEMY: AcademySettings = {
  name: "Gym Demo",
  email: "contato@gymdemo.com.br",
  phone: "(11) 4002-8922",
  address: "Av. Paulista, 1500 — São Paulo, SP",
  slug: "gym-demo",
  primaryColor: "#e8551c",
  secondaryColor: "#0f766e",
  plan: "business",
};

/* ============================================================
   Admin — DRE / custos
   ============================================================ */

export const MOCK_DRE: DREData = {
  monthLabel: "Abril 2026",
  revenue: {
    total: "R$ 18.420",
    deltaLabel: "+8,2% vs março",
    trend: "up",
  },
  expenses: {
    total: "R$ 9.800",
    fixed: "R$ 7.500",
    variable: "R$ 2.300",
  },
  profit: {
    total: "R$ 8.620",
    marginPercent: 46.8,
  },
  cashFlow: [
    { label: "Nov", revenue: 14200, expenses: 8400, profit: 5800 },
    { label: "Dez", revenue: 15100, expenses: 8600, profit: 6500 },
    { label: "Jan", revenue: 16280, expenses: 8900, profit: 7380 },
    { label: "Fev", revenue: 15900, expenses: 9100, profit: 6800 },
    { label: "Mar", revenue: 17020, expenses: 9350, profit: 7670 },
    { label: "Abr", revenue: 18420, expenses: 9800, profit: 8620 },
  ],
  categoryBreakdown: [
    { category: "rent", label: "Aluguel", amount: "R$ 4.500", percent: 45.9 },
    { category: "payroll", label: "Salários", amount: "R$ 3.000", percent: 30.6 },
    { category: "marketing", label: "Marketing", amount: "R$ 900", percent: 9.2 },
    { category: "utilities", label: "Utilidades", amount: "R$ 800", percent: 8.2 },
    { category: "equipment", label: "Equipamentos", amount: "R$ 350", percent: 3.6 },
    { category: "other", label: "Outros", amount: "R$ 250", percent: 2.5 },
  ],
  expensesTotalLabel: "R$ 9.800",
  expenseRows: [
    {
      id: "e1",
      description: "Aluguel — Abril",
      subtitle: "Recorrente · Todo dia 5",
      category: "rent",
      categoryLabel: "Aluguel",
      type: "fixed",
      dueDate: "05/04/2026",
      amount: "R$ 4.500,00",
      status: "paid",
    },
    {
      id: "e2",
      description: "Folha de Pagamento",
      subtitle: "2 instrutores + 1 recepcionista",
      category: "payroll",
      categoryLabel: "Salários",
      type: "fixed",
      dueDate: "05/04/2026",
      amount: "R$ 3.000,00",
      status: "paid",
    },
    {
      id: "e3",
      description: "Google Ads — Abril",
      subtitle: "Campanha matrícula nova turma",
      category: "marketing",
      categoryLabel: "Marketing",
      type: "variable",
      dueDate: "30/04/2026",
      amount: "R$ 900,00",
      status: "pending",
    },
    {
      id: "e4",
      description: "Conta de Luz",
      subtitle: "CPFL — Referência Março/26",
      category: "utilities",
      categoryLabel: "Utilidades",
      type: "fixed",
      dueDate: "10/04/2026",
      amount: "R$ 480,00",
      status: "paid",
    },
    {
      id: "e5",
      description: "Internet + Telefone",
      category: "utilities",
      categoryLabel: "Utilidades",
      type: "fixed",
      dueDate: "15/04/2026",
      amount: "R$ 320,00",
      status: "paid",
    },
    {
      id: "e6",
      description: "Manutenção Esteira #3",
      subtitle: "Técnico agendado",
      category: "equipment",
      categoryLabel: "Equipamentos",
      type: "variable",
      dueDate: "20/04/2026",
      amount: "R$ 350,00",
      status: "open",
    },
  ],
};

/* ============================================================
   Admin — dependentes / famílias
   ============================================================ */

export const MOCK_FAMILIES: GuardianFamily[] = [
  {
    id: "f1",
    guardian: {
      name: "Ana Costa",
      initials: "AC",
      avatarGradient: "linear-gradient(135deg, #e8551c, #c4431d)",
      email: "ana@email.com",
      phone: "(11) 98765-4321",
    },
    dependents: [
      {
        id: "d1",
        name: "Sofia Costa",
        age: 8,
        className: "Natação Infantil",
        classTime: "Turma Segunda 16h",
        status: "active",
        gender: "girl",
        medicalAlert: "Alergia a cloro",
      },
      {
        id: "d2",
        name: "Pedro Costa",
        age: 10,
        className: "Natação Infantil",
        classTime: "Turma Quarta 17h",
        status: "active",
        gender: "boy",
      },
    ],
  },
  {
    id: "f2",
    guardian: {
      name: "Roberto Santos",
      initials: "RS",
      avatarGradient: "linear-gradient(135deg, #0369a1, #0284c7)",
      email: "roberto@email.com",
      phone: "(11) 91234-5678",
    },
    dependents: [
      {
        id: "d3",
        name: "Laura Santos",
        age: 6,
        className: "Baby Class",
        classTime: "Turma Terça 15h",
        status: "active",
        gender: "girl",
      },
      {
        id: "d4",
        name: "Mateus Santos",
        age: 9,
        className: "Natação Infantil",
        classTime: "Turma Quinta 16h",
        status: "pending",
        gender: "boy",
      },
      {
        id: "d5",
        name: "Bia Santos",
        age: 12,
        className: "Natação Avançado",
        classTime: "Turma Sexta 17h",
        status: "active",
        gender: "girl",
        medicalAlert: "Asma leve",
      },
    ],
  },
  {
    id: "f3",
    guardian: {
      name: "Marcos Lima",
      initials: "ML",
      avatarGradient: "linear-gradient(135deg, #0f766e, #059669)",
      email: "marcos@email.com",
      phone: "(11) 99876-5432",
    },
    dependents: [
      {
        id: "d6",
        name: "Gabriel Lima",
        age: 7,
        className: "Baby Class",
        classTime: "Turma Segunda 16h",
        status: "inactive",
        gender: "boy",
      },
    ],
  },
];

/* ============================================================
   Admin — fichas de treino
   ============================================================ */

export const MOCK_WORKOUTS: WorkoutsData = {
  subtitle: "8 fichas ativas — criadas pelo instrutor",
  tabs: [
    { id: "active", label: "Fichas Ativas" },
    { id: "assessments", label: "Avaliações Físicas" },
    { id: "archived", label: "Arquivadas" },
  ],
  cards: [
    {
      id: "w1",
      name: "Treino A — Peito e Tríceps",
      exerciseCount: 5,
      createdAt: "14/03",
      instructorName: "Rafael",
      iconEmoji: "🏋️",
      iconBg: "#fde2d0",
      student: {
        initials: "JS",
        gradient: "linear-gradient(135deg, #e8551c, #c4431d)",
      },
      exercises: [
        { name: "Supino Reto", sets: "4×12", load: "60kg" },
        { name: "Crucifixo Inclinado", sets: "3×15", load: "16kg" },
        { name: "Tríceps Corda", sets: "4×12", load: "25kg" },
      ],
      status: "active",
    },
    {
      id: "w2",
      name: "Treino B — Pernas",
      exerciseCount: 6,
      createdAt: "14/03",
      instructorName: "Rafael",
      iconEmoji: "🦵",
      iconBg: "#e0f2fe",
      student: {
        initials: "JS",
        gradient: "linear-gradient(135deg, #e8551c, #c4431d)",
      },
      exercises: [
        { name: "Agachamento Livre", sets: "4×10", load: "80kg" },
        { name: "Leg Press 45°", sets: "4×12", load: "120kg" },
        { name: "Cadeira Extensora", sets: "3×15", load: "40kg" },
      ],
      status: "active",
    },
    {
      id: "w3",
      name: "Natação Iniciante",
      exerciseCount: 4,
      createdAt: "01/04",
      instructorName: "Carla",
      iconEmoji: "🏊",
      iconBg: "#d1fae5",
      student: {
        initials: "SC",
        gradient: "linear-gradient(135deg, #0369a1, #0284c7)",
      },
      exercises: [
        { name: "Crawl — 25m", sets: "4×1 volta", load: "—" },
        { name: "Costas — 25m", sets: "3×1 volta", load: "—" },
        { name: "Peito — 25m", sets: "3×1 volta", load: "—" },
      ],
      status: "active",
    },
    {
      id: "w4",
      name: "Funcional Avançado",
      exerciseCount: 7,
      createdAt: "02/04",
      instructorName: "Carlos",
      iconEmoji: "🥊",
      iconBg: "#fde2d0",
      student: {
        initials: "ML",
        gradient: "linear-gradient(135deg, #0f766e, #059669)",
      },
      exercises: [
        { name: "Burpees", sets: "4×15", load: "—" },
        { name: "Kettlebell Swing", sets: "4×20", load: "16kg" },
        { name: "Box Jump", sets: "3×10", load: "—" },
      ],
      status: "active",
    },
  ],
};
