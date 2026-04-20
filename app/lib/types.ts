/**
 * Domain types used by the UI. Intentionally decoupled from the
 * generated GraphQL types so both the mock data source and the API
 * data source can conform to the same shape.
 *
 * When the API data source resolves a `MyDashboard` query, it maps
 * the GraphQL response into these types. The UI components only ever
 * see `DashboardData`.
 */

export type EnrollmentStatus = 'em_dia' | 'pendente' | 'atrasado';

export interface Exercise {
  num: number;
  name: string;
  detail: string; // "4×12"
  load: string; // "60 kg" or "—"
}

export interface DashboardData {
  student: {
    name: string;
  };
  academy: {
    name: string;
    tagline: string;
    initials: string; // derived, used by the logo placeholder
    primaryColor: string;
    primaryDark: string;
  };
  nextClass: {
    name: string;
    timeLabel: string;
    room: string;
    booked: boolean;
  } | null;
  enrollment: {
    planName: string;
    amount: string; // already formatted: "R$ 99,00"
    dueDate: string; // already formatted: "15/05/2026"
    method: string; // "PIX" / "Cartão" / "Boleto"
    status: EnrollmentStatus;
  } | null;
  workout: {
    name: string;
    instructor: string;
    updatedLabel: string; // "RAFAEL · ATUALIZADO 03/04"
    exercises: Exercise[];
  } | null;
}

/* ------------------------------------------------------------------
 * Agenda tab — weekly schedule with per-day class list
 * ------------------------------------------------------------------ */
export type ClassBookingStatus = 'available' | 'booked' | 'waitlist' | 'full';

export interface ClassSlot {
  id: string;
  startTime: string; // "06:00"
  endTime: string; // "07:00"
  name: string; // "Musculação Turma A"
  instructor: string; // "RAFAEL"
  room: string; // "SALA 1"
  capacity: number;
  taken: number;
  status: ClassBookingStatus;
}

export interface ScheduleDay {
  id: string; // "2026-04-07"
  weekdayShort: string; // "SEG"
  dayNumber: string; // "07"
  fullTitle: string; // "Quarta-feira"
  fullSubtitle: string; // "9 de abril, 2026"
  isToday: boolean;
  classes: ClassSlot[];
}

/* ------------------------------------------------------------------
 * Treinos tab — active ficha + upcoming + history
 * ------------------------------------------------------------------ */
export interface WorkoutPlanCard {
  id: string;
  name: string; // "Treino A — Peito e Tríceps"
  meta: string; // "RAFAEL · ATUALIZADO 03/04"
  exercises: Exercise[];
}

export interface WorkoutHistoryEntry {
  id: string;
  name: string; // "Treino C — Pernas"
  meta: string; // "SEXTA, 03/04 · 52 MIN"
}

export interface WorkoutsData {
  stats: {
    thisWeek: string; // "3/4"
    thisWeekDelta: string; // "+1 vs sem passada"
    thirtyDays: string; // "12"
    thirtyDaysDelta: string; // "3,2 / sem"
    streak: string; // "7d"
    streakDelta: string; // "recorde: 21d"
  };
  active: WorkoutPlanCard;
  upcoming: Array<{
    id: string;
    name: string;
    meta: string; // "RAFAEL · 6 EXERCÍCIOS"
  }>;
  history: WorkoutHistoryEntry[];
}

/* ------------------------------------------------------------------
 * Finanças tab — next bill, history, payment methods
 * ------------------------------------------------------------------ */
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type PaymentMethodType = 'pix' | 'card' | 'boleto' | 'other';

export interface PaymentRecord {
  id: string;
  name: string; // "Mensalidade · Abril"
  meta: string; // "PIX · 03/04/2026"
  amount: string; // "R$ 99,00"
  method: PaymentMethodType;
  status: PaymentStatus;
}

export interface PaymentsData {
  nextBill: {
    amount: string; // "99,00"
    currency: string; // "R$"
    dueDate: string; // "15/05/2026"
    method: string; // "PIX"
  };
  statusBanner: {
    tone: 'ok' | 'warn' | 'danger';
    title: string;
    body: string;
  };
  history: PaymentRecord[];
  savedMethod: {
    label: string;
    detail: string;
    active: boolean;
  };
}

/* ------------------------------------------------------------------
 * Perfil tab — personal info, body assessments, settings links
 * ------------------------------------------------------------------ */
export interface BodyAssessment {
  id: string;
  date: string; // "15/03/2026"
  weight: string; // "82,4 kg"
  bodyFat: string; // "18,2%"
  delta: string; // "-1,1 kg"
  tone: 'down' | 'up' | 'flat';
}

export interface ProfileData {
  name: string; // "João Silva"
  email: string; // "joao@email.com"
  phone: string; // "(11) 98765-4321"
  memberSince: string; // "DESDE JANEIRO 2024"
  plan: string; // "MENSAL"
  measurements: {
    weight: string;
    height: string;
    bodyFat: string;
  };
  assessments: BodyAssessment[];
}

/**
 * The shape every data source (mock OR Apollo) returns. Mirrors the
 * Apollo `QueryResult` subset the UI actually uses, so the hook is a
 * drop-in swap between the two.
 */
export interface DataSourceResult {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/* ------------------------------------------------------------------
 * Dependentes screen — guardian's children roster
 * ------------------------------------------------------------------ */
export type DependentStatus = 'active' | 'pending' | 'inactive';

export interface DependentInfoRow {
  key: string;
  value: string;
}

export interface DependentEmergencyContact {
  name: string;
  phone: string;
}

export interface DependentRecord {
  id: string;
  name: string;
  gender: 'girl' | 'boy';
  ageLabel: string; // "8 anos · Nascida em 12/03/2018"
  status: DependentStatus;
  medicalAlert?: string;
  info: DependentInfoRow[];
  emergency?: DependentEmergencyContact;
}

export interface DependentsData {
  guardianName: string;
  guardianAcademy: string;
  dependents: DependentRecord[];
}
