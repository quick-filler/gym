/**
 * Data hooks — one per page. Each returns a DataSourceResult shape so
 * components branch on loading/error/data without knowing whether the
 * source is the mock fixtures or the real GraphQL API.
 *
 *   NEXT_PUBLIC_USE_MOCKS=true  — returns MOCK_* fixtures synchronously
 *   NEXT_PUBLIC_USE_MOCKS=false — runs the corresponding Apollo query
 *
 * USE_MOCKS is a module-level constant; each hook always takes the
 * same branch at runtime, so React's rules-of-hooks stay satisfied.
 */

"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { USE_MOCKS } from "./config";
import {
  MOCK_ACADEMY,
  MOCK_DASHBOARD,
  MOCK_DRE,
  MOCK_FAMILIES,
  MOCK_FINANCE,
  MOCK_PRICING_PLANS,
  MOCK_SCHEDULE,
  MOCK_STUDENTS,
  MOCK_WORKOUTS,
} from "./mock-data";
import type {
  AcademySettings,
  DREData,
  DashboardData,
  DataSourceResult,
  FinanceData,
  GuardianFamily,
  PaymentMethod,
  PaymentStatus,
  PricingPlan,
  ScheduleData,
  StudentRow,
  StudentStatus,
  WorkoutsData,
  WorkoutPlanCard,
} from "./types";

/* ============================================================
   GraphQL documents
   ============================================================ */

const ADMIN_DASHBOARD = graphql(`
  query AdminDashboard {
    adminDashboard {
      metrics {
        id
        label
        value
        highlighted
        delta {
          value
          trend
        }
      }
      recentStudents {
        id
        name
        email
        plan
        status
        initials
        joinedAt
      }
      todayClasses {
        id
        name
        instructor
        time
        booked
        capacity
      }
      upcomingPayments {
        id
        student
        amount
        dueDate
        method
      }
    }
  }
`);

const FINANCE_OVERVIEW = graphql(`
  query FinanceOverview($month: Int, $year: Int) {
    financeOverview(month: $month, year: $year) {
      kpis {
        id
        label
        value
        highlighted
        delta {
          value
          trend
        }
      }
      charges {
        id
        student
        studentInitials
        amount
        amountFormatted
        method
        status
        dueDate
        paidAt
      }
      methodBreakdown {
        method
        label
        amount
        percent
      }
    }
  }
`);

const DRE_OVERVIEW = graphql(`
  query DREOverview($month: Int, $year: Int) {
    dreOverview(month: $month, year: $year) {
      monthLabel
      revenue {
        total
        deltaLabel
        trend
      }
      expenses {
        total
        fixed
        variable
      }
      profit {
        total
        marginPercent
      }
      cashFlow {
        label
        revenue
        expenses
        profit
      }
      categoryBreakdown {
        category
        label
        amount
        percent
      }
      expensesTotalLabel
      expenseRows {
        id
        description
        subtitle
        category
        categoryLabel
        type
        dueDate
        amount
        status
      }
    }
  }
`);

const SCHEDULE_WEEK = graphql(`
  query ScheduleWeek($weekStart: String) {
    scheduleWeek(weekStart: $weekStart) {
      weekLabel
      weekNumber
      stats {
        totalClasses
        totalBookings
        capacityFill
      }
      classes {
        id
        name
        instructor
        weekday
        startTime
        endTime
        booked
        capacity
        color
      }
      upcoming {
        id
        name
        time
        instructor
      }
    }
  }
`);

const GUARDIANS = graphql(`
  query Guardians {
    guardians {
      guardian {
        id
        name
        initials
        email
        phone
      }
      dependents {
        id
        name
        age
        className
        classTime
        status
        gender
        medicalAlert
      }
    }
  }
`);

const ADMIN_WORKOUTS = graphql(`
  query AdminWorkouts {
    workoutPlans {
      documentId
      name
      instructor
      isActive
      validFrom
      exercises {
        name
        sets
        reps
        load
      }
      student {
        documentId
        name
      }
    }
  }
`);

const STUDENTS_QUERY = graphql(`
  query Students($pagination: PaginationInput) {
    students(pagination: $pagination) {
      documentId
      name
      email
      phone
      status
      isGuardian
      enrollments {
        documentId
        startDate
        endDate
        paymentMethod
        status
        plan {
          documentId
          name
          price
          billingCycle
        }
      }
    }
  }
`);

const MY_ACADEMY = graphql(`
  query MyAcademy {
    me {
      documentId
      academy {
        documentId
        name
        slug
        primaryColor
        secondaryColor
        plan
        email
        phone
        address
        logo {
          url
          alternativeText
        }
      }
    }
  }
`);

const PRICING_PLANS_PUBLIC = graphql(`
  query PricingPlansPublic {
    plans {
      documentId
      name
      description
      price
      billingCycle
      maxStudents
      features
      isActive
    }
  }
`);

/* ============================================================
   Helpers
   ============================================================ */

function useMocked<T>(value: T): DataSourceResult<T> {
  const data = useMemo(() => value, [value]);
  return { data, loading: false, error: null };
}

function mapDelta(
  delta: { value: string; trend: string } | null | undefined,
): DashboardData["metrics"][number]["delta"] {
  if (!delta) return undefined;
  const trend = (["up", "down", "flat"].includes(delta.trend)
    ? delta.trend
    : "flat") as "up" | "down" | "flat";
  return { value: delta.value, trend };
}

const AVATAR_COLORS = [
  "#e8551c",
  "#0f766e",
  "#0369a1",
  "#be123c",
  "#d97706",
  "#059669",
  "#44403c",
];
const pickColor = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]!;
};

/* ============================================================
   Marketing
   ============================================================ */

export function usePricingPlans(): DataSourceResult<PricingPlan[]> {
  const mocked = USE_MOCKS ? MOCK_PRICING_PLANS : null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(PRICING_PLANS_PUBLIC, { skip: USE_MOCKS });
  if (USE_MOCKS) return { data: mocked, loading: false, error: null };
  if (q.loading) return { data: null, loading: true, error: null };
  if (q.error) return { data: null, loading: false, error: q.error as Error };
  const mapped: PricingPlan[] =
    q.data?.plans
      ?.filter((p): p is NonNullable<typeof p> => !!p && p.isActive !== false)
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
        } satisfies PricingPlan;
      }) ?? [];
  return { data: mapped, loading: false, error: null };
}

/* ============================================================
   Admin
   ============================================================ */

export function useDashboard(): DataSourceResult<DashboardData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(ADMIN_DASHBOARD, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_DASHBOARD);
  if (q.loading) return { data: null, loading: true, error: null };
  if (q.error) return { data: null, loading: false, error: q.error as Error };
  const d = q.data?.adminDashboard;
  if (!d) return { data: null, loading: false, error: null };
  const mapped: DashboardData = {
    metrics: d.metrics.map((m) => ({
      id: m.id,
      label: m.label,
      value: m.value,
      highlighted: m.highlighted ?? false,
      delta: mapDelta(m.delta ?? null) ?? undefined,
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
  return { data: mapped, loading: false, error: null };
}

export function useStudents(): DataSourceResult<StudentRow[]> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(STUDENTS_QUERY, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_STUDENTS);
  if (q.loading) return { data: null, loading: true, error: null };
  if (q.error) return { data: null, loading: false, error: q.error as Error };
  const rows: StudentRow[] =
    q.data?.students?.map((s) => {
      const enrolled = s?.enrollments?.[0];
      const price = enrolled?.plan?.price ?? 0;
      const method = (enrolled?.paymentMethod ?? "pix") as PaymentMethod;
      const initials = (s?.name ?? "?")
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      return {
        id: s?.documentId ?? "",
        name: s?.name ?? "",
        email: s?.email ?? "",
        phone: s?.phone ?? "",
        plan: enrolled?.plan?.name ?? "—",
        planPrice: `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: (s?.status as StudentStatus) ?? "active",
        paymentMethod: method,
        joinedAt: enrolled?.startDate ?? "",
        nextPayment: enrolled?.endDate ?? "—",
        initials,
        avatarColor: pickColor(s?.documentId ?? ""),
      };
    }) ?? [];
  return { data: rows, loading: false, error: null };
}

export function useFinance(): DataSourceResult<FinanceData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(FINANCE_OVERVIEW, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_FINANCE);
  if (q.loading) return { data: null, loading: true, error: null };
  if (q.error) return { data: null, loading: false, error: q.error as Error };
  const f = q.data?.financeOverview;
  if (!f) return { data: null, loading: false, error: null };
  const mapped: FinanceData = {
    kpis: f.kpis.map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      highlighted: k.highlighted ?? false,
      delta: mapDelta(k.delta ?? null) ?? undefined,
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
  return { data: mapped, loading: false, error: null };
}

export function useSchedule(): DataSourceResult<ScheduleData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(SCHEDULE_WEEK, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_SCHEDULE);
  if (q.loading) return { data: null, loading: true, error: null };
  if (q.error) return { data: null, loading: false, error: q.error as Error };
  const s = q.data?.scheduleWeek;
  if (!s) return { data: null, loading: false, error: null };
  const mapped: ScheduleData = {
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
      color: (c.color as "ink" | "flame" | "pine") ?? "ink",
    })),
    upcoming: s.upcoming.map((u) => ({
      id: u.id,
      name: u.name,
      time: u.time,
      instructor: u.instructor ?? "",
    })),
  };
  return { data: mapped, loading: false, error: null };
}

export function useAcademy(): DataSourceResult<AcademySettings> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(MY_ACADEMY, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_ACADEMY);
  if (q.loading) return { data: null, loading: true, error: null };
  if (q.error) return { data: null, loading: false, error: q.error as Error };
  const a = q.data?.me?.academy;
  if (!a) return { data: null, loading: false, error: null };
  const mapped: AcademySettings = {
    name: a.name,
    email: a.email ?? "",
    phone: a.phone ?? "",
    address: a.address ?? "",
    slug: a.slug,
    logoUrl: a.logo?.url ?? undefined,
    primaryColor: a.primaryColor ?? "#0a84ff",
    secondaryColor: a.secondaryColor ?? "#0a84ff",
    plan: (a.plan as AcademySettings["plan"]) ?? "starter",
  };
  return { data: mapped, loading: false, error: null };
}

export function useDRE(): DataSourceResult<DREData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(DRE_OVERVIEW, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_DRE);
  if (q.loading) return { data: null, loading: true, error: null };
  if (q.error) return { data: null, loading: false, error: q.error as Error };
  const d = q.data?.dreOverview;
  if (!d) return { data: null, loading: false, error: null };
  const mapped: DREData = {
    monthLabel: d.monthLabel,
    revenue: {
      total: d.revenue.total,
      deltaLabel: d.revenue.deltaLabel,
      trend: (d.revenue.trend as "up" | "down" | "flat") ?? "flat",
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
  return { data: mapped, loading: false, error: null };
}

export function useDependents(): DataSourceResult<GuardianFamily[]> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(GUARDIANS, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_FAMILIES);
  if (q.loading) return { data: null, loading: true, error: null };
  if (q.error) return { data: null, loading: false, error: q.error as Error };
  const mapped: GuardianFamily[] =
    q.data?.guardians?.map((g) => ({
      id: g.guardian.id,
      guardian: {
        name: g.guardian.name,
        initials: g.guardian.initials,
        avatarGradient: `linear-gradient(135deg, ${pickColor(g.guardian.id)}, ${pickColor(g.guardian.id + "x")})`,
        email: g.guardian.email,
        phone: g.guardian.phone ?? "",
      },
      dependents: g.dependents.map((d) => ({
        id: d.id,
        name: d.name,
        age: d.age,
        className: d.className ?? "",
        classTime: d.classTime ?? "",
        status: (d.status as "active" | "pending" | "inactive") ?? "active",
        gender: (d.gender as "girl" | "boy") ?? "boy",
        medicalAlert: d.medicalAlert ?? undefined,
      })),
    })) ?? [];
  return { data: mapped, loading: false, error: null };
}

export function useWorkouts(): DataSourceResult<WorkoutsData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(ADMIN_WORKOUTS, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_WORKOUTS);
  if (q.loading) return { data: null, loading: true, error: null };
  if (q.error) return { data: null, loading: false, error: q.error as Error };
  const list = q.data?.workoutPlans ?? [];
  const cards: WorkoutPlanCard[] = list.map((w, idx) => {
    const initials = ((w?.student?.name ?? "?")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("") || "?").toUpperCase();
    const exerciseCount = w?.exercises?.length ?? 0;
    const createdAt = w?.validFrom?.slice(5) ?? "";
    const iconList = ["dumbbell", "zap", "droplet", "flame"] as const;
    const icon = iconList[idx % iconList.length]!;
    const color = pickColor(w?.documentId ?? `${idx}`);
    return {
      id: w?.documentId ?? `${idx}`,
      name: w?.name ?? "",
      exerciseCount,
      createdAt,
      instructorName: w?.instructor ?? "",
      icon,
      iconBg: "#eff6ff",
      student: {
        initials,
        gradient: `linear-gradient(135deg, ${color}, ${color})`,
      },
      exercises:
        w?.exercises?.map((e) => ({
          name: e?.name ?? "",
          sets: `${e?.sets ?? ""}×${e?.reps ?? ""}`,
          load: e?.load ?? "—",
        })) ?? [],
      status: (w?.isActive ? "active" : "archived") as "active" | "archived",
    };
  });
  const data: WorkoutsData = {
    subtitle: `${cards.length} fichas — criadas pelo instrutor`,
    tabs: [
      { id: "active", label: "Fichas Ativas" },
      { id: "assessments", label: "Avaliações Físicas" },
      { id: "archived", label: "Arquivadas" },
    ],
    cards,
  };
  return { data, loading: false, error: null };
}

/* Convenience wrapper to keep `useMemo(() => value)` inside a hook. */
function useMockedValue<T>(value: T): DataSourceResult<T> {
  const data = useMemo(() => value, [value]);
  return { data, loading: false, error: null };
}
