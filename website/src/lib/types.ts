/**
 * Domain model shapes — decoupled from the GraphQL schema so mock
 * fixtures stay stable even when the backend schema evolves. Each
 * shape is hand-shaped to match what a page actually renders.
 */

export type PlanTier = "starter" | "business" | "pro";
export type StudentStatus = "active" | "inactive" | "suspended";
export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";
export type PaymentMethod = "pix" | "credit_card" | "boleto";
export type EnrollmentStatus = "active" | "cancelled" | "expired";
export type BookingStatus = "confirmed" | "cancelled" | "attended" | "missed";

export interface DataSourceResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch?: () => void;
}

/* ============================================================
   Marketing surfaces
   ============================================================ */

export interface PricingPlan {
  id: string;
  name: string;
  tag: string;
  priceMonthly: number; // BRL per month
  priceAnnual: number; // BRL per month when billed annually
  tagline: string;
  features: string[];
  featured?: boolean;
  ctaLabel: string;
}

/* ============================================================
   Admin surfaces
   ============================================================ */

export interface MetricDelta {
  value: string;
  trend: "up" | "down" | "flat";
}

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  delta?: MetricDelta;
  sparkline?: number[];
  highlighted?: boolean;
}

export interface DashboardStudentRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: StudentStatus;
  avatarColor: string;
  initials: string;
  joinedAt: string; // DD/MM/YYYY
}

export interface DashboardData {
  metrics: MetricCard[];
  recentStudents: DashboardStudentRow[];
  todayClasses: Array<{
    id: string;
    name: string;
    instructor: string;
    time: string;
    booked: number;
    capacity: number;
  }>;
  upcomingPayments: Array<{
    id: string;
    student: string;
    amount: string;
    dueDate: string;
    method: PaymentMethod;
  }>;
}

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  planPrice: string;
  status: StudentStatus;
  paymentMethod: PaymentMethod;
  joinedAt: string; // DD/MM/YYYY
  nextPayment: string; // DD/MM/YYYY
  initials: string;
  avatarColor: string;
}

export interface PaymentRow {
  id: string;
  student: string;
  studentInitials: string;
  amount: number;
  amountFormatted: string;
  method: PaymentMethod;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
}

export interface FinanceData {
  kpis: MetricCard[];
  charges: PaymentRow[];
  methodBreakdown: Array<{
    method: PaymentMethod;
    label: string;
    amount: string;
    percent: number;
  }>;
}

export interface ScheduleClass {
  id: string;
  name: string;
  instructor: string;
  weekday: number; // 0 = Sunday
  startTime: string; // "06:00"
  endTime: string; // "07:00"
  booked: number;
  capacity: number;
  color: "ink" | "flame" | "pine";
}

export interface ScheduleData {
  classes: ScheduleClass[];
  weekLabel: string;
  weekNumber: number;
  stats: {
    totalClasses: number;
    totalBookings: number;
    capacityFill: number; // percent
  };
  upcoming: Array<{
    id: string;
    name: string;
    time: string;
    instructor: string;
  }>;
}

export interface AcademySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  slug: string; // white-label subdomain
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  plan: PlanTier;
}

/* ============================================================
   Admin — DRE / cost control
   ============================================================ */

export type ExpenseCategory =
  | "rent"
  | "payroll"
  | "marketing"
  | "utilities"
  | "equipment"
  | "supplies"
  | "taxes"
  | "software"
  | "other";

export type ExpenseType = "fixed" | "variable";

export type ExpenseStatus = "paid" | "pending" | "open";

export interface DRECategoryBreakdown {
  category: ExpenseCategory;
  label: string;
  amount: string; // formatted
  percent: number;
}

export interface DRECashFlowPoint {
  label: string; // "Nov", "Dez", …
  revenue: number; // BRL
  expenses: number; // BRL
  profit: number; // BRL
}

export interface DREExpenseRow {
  id: string;
  description: string;
  subtitle?: string;
  category: ExpenseCategory;
  categoryLabel: string;
  type: ExpenseType;
  dueDate: string; // DD/MM/YYYY
  amount: string; // formatted
  status: ExpenseStatus;
}

export interface DREData {
  monthLabel: string; // "Abril 2026"
  revenue: {
    total: string;
    deltaLabel: string;
    trend: "up" | "down" | "flat";
  };
  expenses: {
    total: string;
    fixed: string;
    variable: string;
  };
  profit: {
    total: string;
    marginPercent: number;
  };
  cashFlow: DRECashFlowPoint[];
  categoryBreakdown: DRECategoryBreakdown[];
  expensesTotalLabel: string; // "R$ 9.800"
  expenseRows: DREExpenseRow[];
}

/* ============================================================
   Admin — dependents / families
   ============================================================ */

export type DependentStatus = "active" | "pending" | "inactive";

export interface Dependent {
  id: string;
  name: string;
  age: number;
  className: string; // "Natação Infantil"
  classTime: string; // "Turma Segunda 16h"
  status: DependentStatus;
  gender: "girl" | "boy";
  medicalAlert?: string; // "Alergia a cloro"
}

export interface GuardianFamily {
  id: string;
  guardian: {
    name: string;
    initials: string;
    avatarGradient: string; // tailwind-ready gradient
    email: string;
    phone: string;
  };
  dependents: Dependent[];
}

/* ============================================================
   Admin — workout plans
   ============================================================ */

export interface WorkoutExercise {
  name: string;
  sets: string; // "4×12", "3×15", "4×1 volta"
  load: string; // "60kg" or "—"
}

export interface WorkoutStudent {
  initials: string;
  gradient: string;
}

export type WorkoutTab = "active" | "assessments" | "archived";

export type WorkoutIcon = "dumbbell" | "zap" | "droplet" | "flame";

export interface WorkoutPlanCard {
  id: string;
  name: string;
  exerciseCount: number;
  createdAt: string; // "14/03"
  instructorName: string;
  icon: WorkoutIcon;
  iconBg: string; // css color for icon background tile
  student: WorkoutStudent;
  exercises: WorkoutExercise[];
  status: "active" | "archived";
}

export interface WorkoutsData {
  subtitle: string; // "8 fichas ativas — criadas pelo instrutor"
  tabs: Array<{ id: WorkoutTab; label: string }>;
  cards: WorkoutPlanCard[];
}
