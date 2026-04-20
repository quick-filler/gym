/**
 * Static mock data that matches the UI domain shapes. Only imported
 * by the mock data source — the API data source never touches this
 * file.
 *
 * Keep the content aligned with the `mockups/app-*.html` visual
 * references so the rendered screens stay in sync with the agreed
 * design. Each export below corresponds to one tab screen.
 */

import type {
  DashboardData,
  DependentsData,
  PaymentsData,
  ProfileData,
  ScheduleDay,
  WorkoutsData,
} from './types';

export const MOCK_DASHBOARD: DashboardData = {
  student: {
    name: 'João',
  },
  academy: {
    name: 'CrossFit SP',
    tagline: 'Unidade Vila Mariana',
    initials: 'CFS',
    primaryColor: '#ef4444',
    primaryDark: '#dc2626',
  },
  nextClass: {
    name: 'Musculação Turma B',
    timeLabel: 'Hoje · 18:00 → 19:00',
    room: 'Sala 1',
    booked: true,
  },
  enrollment: {
    planName: 'Mensal',
    amount: 'R$ 99,00',
    dueDate: '15/05/2026',
    method: 'PIX',
    status: 'em_dia',
  },
  workout: {
    name: 'Treino A — Peito e Tríceps',
    instructor: 'Rafael',
    updatedLabel: 'RAFAEL · ATUALIZADO 03/04',
    exercises: [
      { num: 1, name: 'Supino reto',         detail: '4×12', load: '60 kg' },
      { num: 2, name: 'Crucifixo inclinado', detail: '3×15', load: '16 kg' },
      { num: 3, name: 'Tríceps corda',       detail: '4×12', load: '25 kg' },
      { num: 4, name: 'Mergulho assistido',  detail: '3×10', load: '—'    },
    ],
  },
};

/* ==================================================================
 * AGENDA — weekly schedule
 * ================================================================ */

export const MOCK_SCHEDULE: ScheduleDay[] = [
  {
    id: '2026-04-06',
    weekdayShort: 'SEG',
    dayNumber: '06',
    fullTitle: 'Segunda-feira',
    fullSubtitle: '6 de abril, 2026',
    isToday: false,
    classes: [
      {
        id: 'seg-1',
        startTime: '06:00',
        endTime: '07:00',
        name: 'Musculação Turma A',
        instructor: 'RAFAEL',
        room: 'SALA 1',
        capacity: 20,
        taken: 12,
        status: 'available',
      },
      {
        id: 'seg-2',
        startTime: '18:00',
        endTime: '19:00',
        name: 'Musculação Turma B',
        instructor: 'RAFAEL',
        room: 'SALA 1',
        capacity: 20,
        taken: 17,
        status: 'available',
      },
    ],
  },
  {
    id: '2026-04-07',
    weekdayShort: 'TER',
    dayNumber: '07',
    fullTitle: 'Terça-feira',
    fullSubtitle: '7 de abril, 2026',
    isToday: false,
    classes: [
      {
        id: 'ter-1',
        startTime: '07:00',
        endTime: '08:00',
        name: 'Funcional',
        instructor: 'DIEGO',
        room: 'SALA 2',
        capacity: 25,
        taken: 14,
        status: 'available',
      },
    ],
  },
  {
    id: '2026-04-08',
    weekdayShort: 'QUA',
    dayNumber: '08',
    fullTitle: 'Quarta-feira',
    fullSubtitle: '8 de abril, 2026',
    isToday: true,
    classes: [
      {
        id: 'qua-1',
        startTime: '06:00',
        endTime: '07:00',
        name: 'Musculação Turma A',
        instructor: 'RAFAEL',
        room: 'SALA 1',
        capacity: 20,
        taken: 16,
        status: 'available',
      },
      {
        id: 'qua-2',
        startTime: '07:00',
        endTime: '08:00',
        name: 'Funcional',
        instructor: 'DIEGO',
        room: 'SALA 1',
        capacity: 25,
        taken: 22,
        status: 'available',
      },
      {
        id: 'qua-3',
        startTime: '12:00',
        endTime: '13:00',
        name: 'Almoço express',
        instructor: 'DIEGO',
        room: 'SALA 1',
        capacity: 15,
        taken: 15,
        status: 'waitlist',
      },
      {
        id: 'qua-4',
        startTime: '18:00',
        endTime: '19:00',
        name: 'Musculação Turma B',
        instructor: 'RAFAEL',
        room: 'SALA 1',
        capacity: 20,
        taken: 19,
        status: 'booked',
      },
      {
        id: 'qua-5',
        startTime: '19:00',
        endTime: '20:30',
        name: 'CrossFit Open',
        instructor: 'RAFAEL',
        room: 'BOX',
        capacity: 16,
        taken: 14,
        status: 'available',
      },
    ],
  },
  {
    id: '2026-04-09',
    weekdayShort: 'QUI',
    dayNumber: '09',
    fullTitle: 'Quinta-feira',
    fullSubtitle: '9 de abril, 2026',
    isToday: false,
    classes: [
      {
        id: 'qui-1',
        startTime: '07:00',
        endTime: '08:00',
        name: 'Funcional',
        instructor: 'DIEGO',
        room: 'SALA 2',
        capacity: 25,
        taken: 10,
        status: 'available',
      },
      {
        id: 'qui-2',
        startTime: '19:00',
        endTime: '20:00',
        name: 'Musculação Turma C',
        instructor: 'JULIA',
        room: 'SALA 1',
        capacity: 20,
        taken: 8,
        status: 'available',
      },
    ],
  },
  {
    id: '2026-04-10',
    weekdayShort: 'SEX',
    dayNumber: '10',
    fullTitle: 'Sexta-feira',
    fullSubtitle: '10 de abril, 2026',
    isToday: false,
    classes: [
      {
        id: 'sex-1',
        startTime: '06:00',
        endTime: '07:00',
        name: 'Musculação Turma A',
        instructor: 'RAFAEL',
        room: 'SALA 1',
        capacity: 20,
        taken: 11,
        status: 'available',
      },
    ],
  },
  {
    id: '2026-04-11',
    weekdayShort: 'SÁB',
    dayNumber: '11',
    fullTitle: 'Sábado',
    fullSubtitle: '11 de abril, 2026',
    isToday: false,
    classes: [
      {
        id: 'sab-1',
        startTime: '09:00',
        endTime: '10:30',
        name: 'CrossFit Open',
        instructor: 'RAFAEL',
        room: 'BOX',
        capacity: 16,
        taken: 5,
        status: 'available',
      },
    ],
  },
  {
    id: '2026-04-12',
    weekdayShort: 'DOM',
    dayNumber: '12',
    fullTitle: 'Domingo',
    fullSubtitle: '12 de abril, 2026',
    isToday: false,
    classes: [],
  },
];

/* ==================================================================
 * TREINOS — active plan + upcoming + history
 * ================================================================ */

export const MOCK_WORKOUTS: WorkoutsData = {
  stats: {
    thisWeek: '3/4',
    thisWeekDelta: '+1 vs sem passada',
    thirtyDays: '12',
    thirtyDaysDelta: '3,2 / sem',
    streak: '7d',
    streakDelta: 'recorde: 21d',
  },
  active: {
    id: 'plan-a',
    name: 'Treino A — Peito e Tríceps',
    meta: 'RAFAEL · ATUALIZADO 03/04',
    exercises: [
      { num: 1, name: 'Supino reto',         detail: '4×12', load: '60 kg' },
      { num: 2, name: 'Crucifixo inclinado', detail: '3×15', load: '16 kg' },
      { num: 3, name: 'Tríceps corda',       detail: '4×12', load: '25 kg' },
      { num: 4, name: 'Mergulho assistido',  detail: '3×10', load: '—'    },
      { num: 5, name: 'Tríceps testa',       detail: '3×12', load: '12 kg' },
    ],
  },
  upcoming: [
    {
      id: 'plan-b',
      name: 'Treino B — Costas e Bíceps',
      meta: 'RAFAEL · 6 EXERCÍCIOS',
    },
    {
      id: 'plan-c',
      name: 'Treino C — Pernas',
      meta: 'RAFAEL · 7 EXERCÍCIOS',
    },
  ],
  history: [
    {
      id: 'hist-1',
      name: 'Treino C — Pernas',
      meta: 'SEXTA, 03/04 · 52 MIN',
    },
    {
      id: 'hist-2',
      name: 'Treino B — Costas e Bíceps',
      meta: 'QUARTA, 01/04 · 47 MIN',
    },
    {
      id: 'hist-3',
      name: 'Treino A — Peito e Tríceps',
      meta: 'SEGUNDA, 30/03 · 51 MIN',
    },
  ],
};

/* ==================================================================
 * FINANÇAS — next bill + history + payment method
 * ================================================================ */

export const MOCK_PAYMENTS: PaymentsData = {
  nextBill: {
    currency: 'R$',
    amount: '99,00',
    dueDate: '15/05/2026',
    method: 'PIX',
  },
  statusBanner: {
    tone: 'ok',
    title: 'Tudo em dia',
    body: 'Sua matrícula está ativa até 15/05/2026.',
  },
  history: [
    {
      id: 'pay-1',
      name: 'Mensalidade · Abril',
      meta: 'PIX · 03/04/2026',
      amount: 'R$ 99,00',
      method: 'pix',
      status: 'paid',
    },
    {
      id: 'pay-2',
      name: 'Mensalidade · Março',
      meta: 'PIX · 02/03/2026',
      amount: 'R$ 99,00',
      method: 'pix',
      status: 'paid',
    },
    {
      id: 'pay-3',
      name: 'Mensalidade · Fevereiro',
      meta: 'PIX · 01/02/2026',
      amount: 'R$ 99,00',
      method: 'pix',
      status: 'paid',
    },
    {
      id: 'pay-4',
      name: 'Mensalidade · Janeiro',
      meta: 'CARTÃO · 01/01/2026',
      amount: 'R$ 99,00',
      method: 'card',
      status: 'paid',
    },
    {
      id: 'pay-5',
      name: 'Avaliação física',
      meta: 'PIX · 12/12/2025',
      amount: 'R$ 80,00',
      method: 'other',
      status: 'paid',
    },
  ],
  savedMethod: {
    label: 'PIX',
    detail: 'PADRÃO · INSTANTÂNEO',
    active: true,
  },
};

/* ==================================================================
 * PERFIL — personal info + body assessments
 * ================================================================ */

export const MOCK_PROFILE: ProfileData = {
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(11) 98765-4321',
  memberSince: 'DESDE JANEIRO 2024',
  plan: 'MENSAL',
  measurements: {
    weight: '82,4 kg',
    height: '1,78 m',
    bodyFat: '18,2%',
  },
  assessments: [
    {
      id: 'asm-1',
      date: '15/03/2026',
      weight: '82,4 kg',
      bodyFat: '18,2%',
      delta: '-1,1 kg',
      tone: 'down',
    },
    {
      id: 'asm-2',
      date: '15/02/2026',
      weight: '83,5 kg',
      bodyFat: '19,0%',
      delta: '-0,4 kg',
      tone: 'down',
    },
    {
      id: 'asm-3',
      date: '15/01/2026',
      weight: '83,9 kg',
      bodyFat: '19,4%',
      delta: '+0,2 kg',
      tone: 'up',
    },
  ],
};

export const MOCK_DEPENDENTS: DependentsData = {
  guardianName: 'Ana Costa',
  guardianAcademy: 'Gym',
  dependents: [
    {
      id: 'dep-1',
      name: 'Sofia Costa',
      gender: 'girl',
      ageLabel: '8 anos · Nascida em 12/03/2018',
      status: 'active',
      medicalAlert: 'Alergia a cloro — informar instrutor',
      info: [
        { key: 'Plano', value: 'Academia — R$ 120/mês' },
        { key: 'Turma', value: 'Segunda e Quarta · 16h00' },
        { key: 'Tipo sanguíneo', value: 'A+' },
        { key: 'Próx. vencimento', value: '15/05/2026' },
      ],
      emergency: {
        name: 'Carlos Costa (pai)',
        phone: '(11) 99999-1234',
      },
    },
    {
      id: 'dep-2',
      name: 'Pedro Costa',
      gender: 'boy',
      ageLabel: '10 anos · Nascido em 05/07/2016',
      status: 'active',
      info: [
        { key: 'Plano', value: 'Academia — R$ 120/mês' },
        { key: 'Turma', value: 'Quarta e Sexta · 17h00' },
        { key: 'Tipo sanguíneo', value: 'O+' },
        { key: 'Próx. vencimento', value: '15/05/2026' },
      ],
    },
  ],
};
