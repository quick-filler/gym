/**
 * Static mock data that matches the `DashboardData` shape used by the
 * UI. Only imported by the mock data source — the API data source
 * never touches this file.
 *
 * Keep the content aligned with `mockups/student-dashboard.html` so
 * the visual reference stays in sync.
 */

import type { DashboardData } from './types';

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
