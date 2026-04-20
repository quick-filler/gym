/**
 * GraphQL → domain mappers.
 *
 * Each exported function takes the aggregate GraphQL response (loosely
 * typed so the file has zero dependency on the generated `src/gql/`
 * types) and returns the domain shape declared in `src/lib/types.ts`.
 *
 * Extracted from hooks.ts so the mappers are pure, unit-testable, and
 * free to evolve without the Apollo `useQuery` boilerplate.
 */

import type {
  AcademySettings,
  DREData,
  DashboardData,
  FinanceData,
  GuardianFamily,
  MetricDelta,
  PaymentMethod,
  PaymentStatus,
  PricingPlan,
  ScheduleData,
  StudentRow,
  StudentStatus,
  WorkoutPlanCard,
  WorkoutsData,
} from "./types";

/* ------------------------------------------------------------------
 * Shared helpers
 * ------------------------------------------------------------------ */

/**
 * Stable pastel-ish colour for avatars, keyed off any string. Used so
 * the UI has a non-grey placeholder until a photo is uploaded.
 */
const AVATAR_COLORS = [
  "#e8551c",
  "#0f766e",
  "#0369a1",
  "#be123c",
  "#d97706",
  "#059669",
  "#44403c",
];

export function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]!;
}

export function initialsFromName(name: string | null | undefined): string {
  const s = (name ?? "").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function mapDelta(
  delta: { value: string; trend: string } | null | undefined,
): MetricDelta | undefined {
  if (!delta) return undefined;
  const trend = (["up", "down", "flat"].includes(delta.trend)
    ? delta.trend
    : "flat") as "up" | "down" | "flat";
  return { value: delta.value, trend };
}

/* ------------------------------------------------------------------
 * Marketing
 * ------------------------------------------------------------------ */

export interface RawPricingPlan {
  documentId: string;
  name: string;
  description?: string | null;
  price: number;
  billingCycle: string;
  maxStudents?: number | null;
  features?: Array<string | null> | null;
  isActive?: boolean | null;
}

export function mapPricingPlans(
  plans: Array<RawPricingPlan | null> | null | undefined,
): PricingPlan[] {
  return (plans ?? [])
    .filter((p): p is RawPricingPlan => !!p && p.isActive !== false)
    .map((p, idx) => {
      const monthly =
        p.billingCycle === "annual"
          ? Math.round(p.price / 12)
          : Math.round(p.price);
      return {
        id: p.documentId,
        name: p.name,
        tag: p.billingCycle === "annual" ? "Anual" : "Mensal",
        priceMonthly: monthly,
        priceAnnual: Math.round(monthly * 0.8),
        tagline: p.description ?? "",
        features: (p.features ?? []).filter((f): f is string => !!f),
        featured: idx === 1,
        ctaLabel: "Quero uma demonstração",
      };
    });
}

/* ------------------------------------------------------------------
 * Admin dashboard
 * ------------------------------------------------------------------ */

export interface RawAdminDashboard {
  metrics: Array<{
    id: string;
    label: string;
    value: string;
    highlighted?: boolean | null;
    delta?: { value: string; trend: string } | null;
  }>;
  recentStudents: Array<{
    id: string;
    name: string;
    email: string;
    plan: string;
    status: string;
    initials: string;
    joinedAt?: string | null;
  }>;
  todayClasses: Array<{
    id: string;
    name: string;
    instructor?: string | null;
    time: string;
    booked: number;
    capacity: number;
  }>;
  upcomingPayments: Array<{
    id: string;
    student: string;
    amount: string;
    dueDate: string;
    method: string;
  }>;
}

export function mapDashboard(d: RawAdminDashboard): DashboardData {
  return {
    metrics: d.metrics.map((m) => ({
      id: m.id,
      label: m.label,
      value: m.value,
      highlighted: m.highlighted ?? false,
      delta: mapDelta(m.delta),
    })),
    recentStudents: d.recentStudents.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      plan: s.plan,
      status: (s.status as StudentStatus) ?? "active",
      initials: s.initials,
      avatarColor: pickColor(s.id),
      joinedAt: s.joinedAt ?? "",
    })),
    todayClasses: d.todayClasses.map((c) => ({
      id: c.id,
      name: c.name,
      instructor: c.instructor ?? "",
      time: c.time,
      booked: c.booked,
      capacity: c.capacity,
    })),
    upcomingPayments: d.upcomingPayments.map((p) => ({
      id: p.id,
      student: p.student,
      amount: p.amount,
      dueDate: p.dueDate,
      method: p.method as PaymentMethod,
    })),
  };
}

/* ------------------------------------------------------------------
 * Students list
 * ------------------------------------------------------------------ */

export interface RawStudent {
  documentId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  isGuardian?: boolean | null;
  enrollments?: Array<{
    documentId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    paymentMethod?: string | null;
    status?: string | null;
    plan?: {
      documentId?: string | null;
      name?: string | null;
      price?: number | null;
      billingCycle?: string | null;
    } | null;
  } | null> | null;
}

export function mapStudents(
  students: Array<RawStudent | null> | null | undefined,
): StudentRow[] {
  return (students ?? [])
    .filter((s): s is RawStudent => !!s)
    .map((s) => {
      const enrolled = s.enrollments?.[0];
      const price = enrolled?.plan?.price ?? 0;
      const method = (enrolled?.paymentMethod ?? "pix") as PaymentMethod;
      return {
        id: s.documentId ?? "",
        name: s.name ?? "",
        email: s.email ?? "",
        phone: s.phone ?? "",
        plan: enrolled?.plan?.name ?? "—",
        planPrice: `R$ ${price.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        status: (s.status as StudentStatus) ?? "active",
        paymentMethod: method,
        joinedAt: enrolled?.startDate ?? "",
        nextPayment: enrolled?.endDate ?? "—",
        initials: initialsFromName(s.name ?? ""),
        avatarColor: pickColor(s.documentId ?? ""),
      };
    });
}

/* ------------------------------------------------------------------
 * Finance
 * ------------------------------------------------------------------ */

export interface RawFinanceOverview {
  kpis: Array<{
    id: string;
    label: string;
    value: string;
    highlighted?: boolean | null;
    delta?: { value: string; trend: string } | null;
  }>;
  charges: Array<{
    id: string;
    student: string;
    studentInitials: string;
    amount: number;
    amountFormatted: string;
    method: string;
    status: string;
    dueDate: string;
    paidAt?: string | null;
  }>;
  methodBreakdown: Array<{
    method: string;
    label: string;
    amount: string;
    percent: number;
  }>;
}

export function mapFinance(f: RawFinanceOverview): FinanceData {
  return {
    kpis: f.kpis.map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      highlighted: k.highlighted ?? false,
      delta: mapDelta(k.delta),
    })),
    charges: f.charges.map((c) => ({
      id: c.id,
      student: c.student,
      studentInitials: c.studentInitials,
      amount: c.amount,
      amountFormatted: c.amountFormatted,
      method: c.method as PaymentMethod,
      status: c.status as PaymentStatus,
      dueDate: c.dueDate,
      paidAt: c.paidAt ?? undefined,
    })),
    methodBreakdown: f.methodBreakdown.map((m) => ({
      method: m.method as PaymentMethod,
      label: m.label,
      amount: m.amount,
      percent: m.percent,
    })),
  };
}

/* ------------------------------------------------------------------
 * Schedule
 * ------------------------------------------------------------------ */

export interface RawScheduleWeek {
  weekLabel: string;
  weekNumber: number;
  stats: { totalClasses: number; totalBookings: number; capacityFill: number };
  classes: Array<{
    id: string;
    name: string;
    instructor?: string | null;
    weekday: number;
    startTime: string;
    endTime: string;
    booked: number;
    capacity: number;
    color: string;
  }>;
  upcoming: Array<{
    id: string;
    name: string;
    time: string;
    instructor?: string | null;
  }>;
}

export function mapSchedule(s: RawScheduleWeek): ScheduleData {
  return {
    weekLabel: s.weekLabel,
    weekNumber: s.weekNumber,
    stats: s.stats,
    classes: s.classes.map((c) => ({
      id: c.id,
      name: c.name,
      instructor: c.instructor ?? "",
      weekday: c.weekday,
      startTime: c.startTime,
      endTime: c.endTime,
      booked: c.booked,
      capacity: c.capacity,
      color: (["ink", "flame", "pine"].includes(c.color)
        ? c.color
        : "ink") as "ink" | "flame" | "pine",
    })),
    upcoming: s.upcoming.map((u) => ({
      id: u.id,
      name: u.name,
      time: u.time,
      instructor: u.instructor ?? "",
    })),
  };
}

/* ------------------------------------------------------------------
 * Academy (from `me.academy`)
 * ------------------------------------------------------------------ */

export interface RawAcademy {
  name: string;
  slug: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  plan?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo?: { url?: string | null } | null;
}

export function mapAcademy(a: RawAcademy): AcademySettings {
  return {
    name: a.name,
    email: a.email ?? "",
    phone: a.phone ?? "",
    address: a.address ?? "",
    slug: a.slug,
    logoUrl: a.logo?.url ?? undefined,
    primaryColor: a.primaryColor ?? "#0a84ff",
    secondaryColor: a.secondaryColor ?? "#0a84ff",
    plan: (["starter", "business", "pro"].includes(a.plan ?? "")
      ? a.plan
      : "starter") as AcademySettings["plan"],
  };
}

/* ------------------------------------------------------------------
 * DRE
 * ------------------------------------------------------------------ */

export interface RawDREOverview {
  monthLabel: string;
  revenue: { total: string; deltaLabel: string; trend: string };
  expenses: { total: string; fixed: string; variable: string };
  profit: { total: string; marginPercent: number };
  cashFlow: Array<{
    label: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    label: string;
    amount: string;
    percent: number;
  }>;
  expensesTotalLabel: string;
  expenseRows: Array<{
    id: string;
    description: string;
    subtitle?: string | null;
    category: string;
    categoryLabel: string;
    type: string;
    dueDate: string;
    amount: string;
    status: string;
  }>;
}

export function mapDRE(d: RawDREOverview): DREData {
  return {
    monthLabel: d.monthLabel,
    revenue: {
      total: d.revenue.total,
      deltaLabel: d.revenue.deltaLabel,
      trend: (["up", "down", "flat"].includes(d.revenue.trend)
        ? d.revenue.trend
        : "flat") as "up" | "down" | "flat",
    },
    expenses: {
      total: d.expenses.total,
      fixed: d.expenses.fixed,
      variable: d.expenses.variable,
    },
    profit: {
      total: d.profit.total,
      marginPercent: d.profit.marginPercent,
    },
    cashFlow: d.cashFlow.map((c) => ({
      label: c.label,
      revenue: c.revenue,
      expenses: c.expenses,
      profit: c.profit,
    })),
    categoryBreakdown: d.categoryBreakdown.map((c) => ({
      category: c.category as DREData["categoryBreakdown"][number]["category"],
      label: c.label,
      amount: c.amount,
      percent: c.percent,
    })),
    expensesTotalLabel: d.expensesTotalLabel,
    expenseRows: d.expenseRows.map((r) => ({
      id: r.id,
      description: r.description,
      subtitle: r.subtitle ?? undefined,
      category: r.category as DREData["expenseRows"][number]["category"],
      categoryLabel: r.categoryLabel,
      type: r.type as DREData["expenseRows"][number]["type"],
      dueDate: r.dueDate,
      amount: r.amount,
      status: r.status as DREData["expenseRows"][number]["status"],
    })),
  };
}

/* ------------------------------------------------------------------
 * Guardians (families)
 * ------------------------------------------------------------------ */

export interface RawGuardian {
  guardian: {
    id: string;
    name: string;
    initials: string;
    email: string;
    phone?: string | null;
  };
  dependents: Array<{
    id: string;
    name: string;
    age: number;
    className?: string | null;
    classTime?: string | null;
    status: string;
    gender?: string | null;
    medicalAlert?: string | null;
  }>;
}

export function mapGuardians(
  guardians: Array<RawGuardian | null> | null | undefined,
): GuardianFamily[] {
  return (guardians ?? [])
    .filter((g): g is RawGuardian => !!g)
    .map((g) => ({
      id: g.guardian.id,
      guardian: {
        name: g.guardian.name,
        initials: g.guardian.initials,
        avatarGradient: `linear-gradient(135deg, ${pickColor(g.guardian.id)}, ${pickColor(
          g.guardian.id + "x",
        )})`,
        email: g.guardian.email,
        phone: g.guardian.phone ?? "",
      },
      dependents: g.dependents.map((d) => ({
        id: d.id,
        name: d.name,
        age: d.age,
        className: d.className ?? "",
        classTime: d.classTime ?? "",
        status: (["active", "pending", "inactive"].includes(d.status)
          ? d.status
          : "active") as "active" | "pending" | "inactive",
        gender: (d.gender === "girl" ? "girl" : "boy") as "girl" | "boy",
        medicalAlert: d.medicalAlert ?? undefined,
      })),
    }));
}

/* ------------------------------------------------------------------
 * Workouts
 * ------------------------------------------------------------------ */

export interface RawWorkoutPlan {
  documentId?: string | null;
  name?: string | null;
  instructor?: string | null;
  isActive?: boolean | null;
  validFrom?: string | null;
  exercises?: Array<{
    name?: string | null;
    sets?: number | null;
    reps?: number | null;
    load?: string | null;
  } | null> | null;
  student?: { documentId?: string | null; name?: string | null } | null;
}

const WORKOUT_ICONS = ["dumbbell", "zap", "droplet", "flame"] as const;

export function mapWorkouts(
  list: Array<RawWorkoutPlan | null> | null | undefined,
): WorkoutsData {
  const safe = list ?? [];
  const cards: WorkoutPlanCard[] = safe
    .filter((w): w is RawWorkoutPlan => !!w)
    .map((w, idx) => {
      const color = pickColor(w.documentId ?? `${idx}`);
      return {
        id: w.documentId ?? `${idx}`,
        name: w.name ?? "",
        exerciseCount: w.exercises?.length ?? 0,
        createdAt: w.validFrom?.slice(5) ?? "",
        instructorName: w.instructor ?? "",
        icon: WORKOUT_ICONS[idx % WORKOUT_ICONS.length]!,
        iconBg: "#eff6ff",
        student: {
          initials: initialsFromName(w.student?.name ?? ""),
          gradient: `linear-gradient(135deg, ${color}, ${color})`,
        },
        exercises: (w.exercises ?? [])
          .filter((e): e is NonNullable<typeof e> => !!e)
          .map((e) => ({
            name: e.name ?? "",
            sets: `${e.sets ?? ""}×${e.reps ?? ""}`,
            load: e.load ?? "—",
          })),
        status: (w.isActive ? "active" : "archived") as "active" | "archived",
      };
    });
  return {
    subtitle: `${cards.length} fichas — criadas pelo instrutor`,
    tabs: [
      { id: "active", label: "Fichas Ativas" },
      { id: "assessments", label: "Avaliações Físicas" },
      { id: "archived", label: "Arquivadas" },
    ],
    cards,
  };
}
