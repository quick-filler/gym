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
  unreadCount: number; // header bell badge — 0 hides the dot
}

/* ------------------------------------------------------------------
 * Agenda tab — weekly schedule with per-day class list
 * ------------------------------------------------------------------ */
// 'available' livre · 'booked' minha reserva confirmada · 'waitlisted' eu na
// fila · 'waitlist'/'full' turma cheia (posso entrar na fila).
export type ClassBookingStatus =
  | 'available'
  | 'booked'
  | 'waitlisted'
  | 'waitlist'
  | 'full';

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
  // Fase 2 — presentes no modo API (Apollo), ausentes no mock:
  scheduleDocumentId?: string;
  date?: string; // "2026-06-08"
  bookable?: boolean; // janela de reserva ainda aberta
  bookingDocumentId?: string | null; // minha reserva (p/ cancelar)
  unlimited?: boolean; // sem maxCapacity definido
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

/** Result of a book/cancel action — drives the toast/alert feedback. */
export interface BookingActionResult {
  ok: boolean;
  status?: string; // 'confirmed' | 'waitlist' | 'cancelled'
  message: string; // user-facing PT-BR feedback
}

/**
 * Shape returned by `useScheduleWeek()` — same contract in mock and API
 * mode so the Agenda screen is a drop-in swap between the two.
 */
export interface ScheduleWeekResult {
  days: ScheduleDay[];
  loading: boolean;
  error: Error | null;
  acting: boolean; // a book/cancel mutation is in flight
  refetch: () => void;
  book: (slot: ClassSlot) => Promise<BookingActionResult>;
  cancel: (slot: ClassSlot) => Promise<BookingActionResult>;
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
 * Treinos tab — wired result (Fase 3, real data via useWorkouts)
 * ------------------------------------------------------------------ */
export interface ActiveWorkoutPlan {
  documentId: string;
  name: string; // "Treino A — Peito e Tríceps"
  meta: string; // "RAFAEL · 5 EXERCÍCIOS"
  exercises: Exercise[];
}

export interface UpcomingWorkoutPlan {
  documentId: string;
  name: string;
  meta: string; // "RAFAEL · 6 EXERCÍCIOS"
}

export interface WorkoutHistorySession {
  documentId: string;
  name: string; // plan name (or "Treino" when the plan is gone)
  meta: string; // "QUA, 03/04 · 52 MIN"
}

export interface WorkoutStatsView {
  thisWeek: string; // count, e.g. "3"
  thirtyDays: string; // count, e.g. "12"
  streak: string; // "7d"
}

export interface WorkoutsResult {
  active: ActiveWorkoutPlan | null;
  upcoming: UpcomingWorkoutPlan[];
  history: WorkoutHistorySession[];
  stats: WorkoutStatsView;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
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
 * Fase 4 — usePayments() view model (backed by GraphQL or mocks)
 * ------------------------------------------------------------------ */

/** One charge as the Finanças screen renders it. */
export interface PaymentView {
  documentId: string;
  name: string; // "Mensalidade · Julho" (from description)
  meta: string; // "PIX · 15/07/2026"
  amount: string; // "R$ 99,00"
  method: PaymentMethodType;
  status: PaymentStatus;
  /** pending | overdue → the row/detail offers a "pagar" action. */
  payable: boolean;
}

export interface NextBillView {
  documentId: string | null; // null when nothing is open
  amount: string; // "99,00"
  currency: string; // "R$"
  dueDate: string; // "15/07/2026"
  method: string; // "PIX"
  overdue: boolean;
}

export interface PaymentsResult {
  nextBill: NextBillView;
  statusBanner: {
    tone: 'ok' | 'warn' | 'danger';
    title: string;
    body: string;
  };
  history: PaymentView[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
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
