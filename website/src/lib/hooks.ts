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
 *
 * All of the GraphQL→domain shape mapping lives in `./mappers.ts` so
 * the mappers are unit-testable without touching Apollo. The only
 * responsibility of this file is wiring mock-or-query → mapper.
 */

"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { USE_MOCKS } from "./config";
import {
  MOCK_ACADEMY,
  MOCK_DAILY_ATTENDANCE,
  MOCK_DASHBOARD,
  MOCK_DRE,
  MOCK_FAMILIES,
  MOCK_FINANCE,
  MOCK_ME,
  MOCK_PLANS,
  MOCK_PRICING_PLANS,
  MOCK_SCHEDULE,
  MOCK_SCHEDULE_BOOKINGS,
  MOCK_STUDENTS,
  MOCK_WORKOUTS,
} from "./mock-data";
import {
  mapAcademy,
  mapBooking,
  mapDailyAttendance,
  mapDRE,
  mapDashboard,
  mapFinance,
  mapGuardians,
  mapMe,
  mapMembershipPlans,
  mapPricingPlans,
  mapSchedule,
  mapStudents,
  mapWorkouts,
} from "./mappers";
import type {
  AcademySettings,
  DailyAttendanceData,
  DREData,
  DashboardData,
  DataSourceResult,
  FinanceData,
  GuardianFamily,
  MeProfile,
  PlansData,
  PricingPlan,
  ScheduleBooking,
  ScheduleData,
  StudentRow,
  WorkoutsData,
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
      revenueTotalLabel
      revenueRows {
        id
        student
        source
        paidAt
        amount
        method
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
        scheduleDocumentId
        name
        instructor
        modality
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

export const CLASS_SCHEDULE_BY_ID = graphql(`
  query AdminClassSchedule($documentId: ID!) {
    classSchedule(documentId: $documentId) {
      documentId
      name
      instructor
      modality
      weekdays
      startTime
      endTime
      maxCapacity
      room
      isActive
    }
  }
`);

export const SCHEDULE_CONFLICTS = graphql(`
  query AdminScheduleConflicts($input: ScheduleConflictInput!) {
    scheduleConflicts(input: $input) {
      reason
      days
      schedule {
        documentId
        name
        instructor
        room
        startTime
        endTime
      }
    }
  }
`);

export const UPDATE_CLASS_SCHEDULE = graphql(`
  mutation AdminUpdateClassSchedule(
    $documentId: ID!
    $data: ClassScheduleUpdateInput!
  ) {
    updateClassSchedule(documentId: $documentId, data: $data) {
      documentId
      name
      isActive
    }
  }
`);

const SCHEDULE_BOOKINGS = graphql(`
  query ScheduleBookings($documentId: ID!, $date: String) {
    scheduleBookings(documentId: $documentId, date: $date) {
      documentId
      date
      status
      checkedInAt
      student {
        documentId
        name
        photo {
          url
        }
      }
    }
  }
`);

const CHECK_IN_BOOKING = graphql(`
  mutation AdminCheckInBooking($documentId: ID!) {
    checkInBooking(documentId: $documentId) {
      documentId
      status
      checkedInAt
    }
  }
`);

const UPDATE_BOOKING_STATUS = graphql(`
  mutation AdminUpdateBookingStatus(
    $documentId: ID!
    $data: ClassBookingUpdateInput!
  ) {
    updateClassBooking(documentId: $documentId, data: $data) {
      documentId
      status
      checkedInAt
    }
  }
`);

const DAILY_ATTENDANCE = graphql(`
  query AdminDailyAttendance($date: String!) {
    dailyAttendance(date: $date) {
      date
      weekdayLabel
      classes {
        scheduleDocumentId
        name
        instructor
        room
        startTime
        endTime
        capacity
        bookedCount
        attendedCount
        missedCount
        bookings {
          documentId
          date
          status
          checkedInAt
          student {
            documentId
            name
            photo {
              url
            }
          }
        }
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

export const WORKOUT_PLAN_BY_ID = graphql(`
  query AdminWorkoutPlan($documentId: ID!) {
    workoutPlan(documentId: $documentId) {
      documentId
      name
      instructor
      isActive
      validFrom
      validTo
      exercises {
        name
        sets
        reps
        load
        notes
      }
      student {
        documentId
        name
      }
    }
  }
`);

export const UPDATE_WORKOUT_PLAN = graphql(`
  mutation AdminUpdateWorkoutPlan(
    $documentId: ID!
    $data: WorkoutPlanUpdateInput!
  ) {
    updateWorkoutPlan(documentId: $documentId, data: $data) {
      documentId
      name
      isActive
    }
  }
`);

export const DELETE_WORKOUT_PLAN = graphql(`
  mutation AdminDeleteWorkoutPlan($documentId: ID!) {
    deleteWorkoutPlan(documentId: $documentId) {
      documentId
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
      name
      email
      role
      photo {
        url
        alternativeText
      }
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
          documentId
          url
          alternativeText
        }
        logoSquare {
          documentId
          url
          alternativeText
        }
      }
    }
  }
`);

const ACADEMY_BY_SLUG = graphql(`
  query AcademyBySlugForLogin($slug: String!) {
    academyBySlug(slug: $slug) {
      documentId
      name
      slug
      primaryColor
      secondaryColor
      logo {
        url
        alternativeText
      }
      logoSquare {
        url
        alternativeText
      }
    }
  }
`);

const UPDATE_ACADEMY = graphql(`
  mutation AdminUpdateAcademy($documentId: ID!, $data: AcademyUpdateInput!) {
    updateAcademy(documentId: $documentId, data: $data) {
      documentId
      name
      slug
      primaryColor
      secondaryColor
      email
      phone
      address
      logo {
        documentId
        url
        alternativeText
      }
      logoSquare {
        documentId
        url
        alternativeText
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

const ADMIN_PLANS = graphql(`
  query AdminPlans {
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
   Shared wire helpers
   ============================================================ */

function useMockedValue<T>(value: T): DataSourceResult<T> {
  const data = useMemo(() => value, [value]);
  return { data, loading: false, error: null };
}

function loadingResult<T>(): DataSourceResult<T> {
  return { data: null, loading: true, error: null };
}

function errorResult<T>(error: unknown): DataSourceResult<T> {
  return { data: null, loading: false, error: error as Error };
}

/* ============================================================
   Marketing
   ============================================================ */

export function usePricingPlans(): DataSourceResult<PricingPlan[]> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(PRICING_PLANS_PUBLIC, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_PRICING_PLANS);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  return {
    data: mapPricingPlans(q.data?.plans ?? null),
    loading: false,
    error: null,
  };
}

/* ============================================================
   Admin
   ============================================================ */

export function useDashboard(): DataSourceResult<DashboardData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(ADMIN_DASHBOARD, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_DASHBOARD);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const d = q.data?.adminDashboard;
  if (!d) return { data: null, loading: false, error: null };
  return { data: mapDashboard(d), loading: false, error: null };
}

export function useStudents(): DataSourceResult<StudentRow[]> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(STUDENTS_QUERY, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_STUDENTS);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  return {
    data: mapStudents(q.data?.students ?? null),
    loading: false,
    error: null,
  };
}

export function useFinance(vars?: { month?: number; year?: number }): DataSourceResult<FinanceData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(FINANCE_OVERVIEW, { skip: USE_MOCKS, variables: vars });
  if (USE_MOCKS) return useMockedValue(MOCK_FINANCE);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const f = q.data?.financeOverview;
  if (!f) return { data: null, loading: false, error: null };
  return { data: mapFinance(f), loading: false, error: null };
}

export function useSchedule(
  vars?: { weekStart?: string },
): DataSourceResult<ScheduleData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(SCHEDULE_WEEK, {
    variables: { weekStart: vars?.weekStart },
    skip: USE_MOCKS,
  });
  if (USE_MOCKS) return useMockedValue(MOCK_SCHEDULE);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const s = q.data?.scheduleWeek;
  if (!s) return { data: null, loading: false, error: null };
  return { data: mapSchedule(s), loading: false, error: null };
}

/**
 * Bookings for a specific class on a specific date. Skips the network
 * call when documentId or date is null so the same hook can power a
 * drawer that's mounted-but-empty.
 */
export function useScheduleBookings(
  documentId: string | null,
  date: string | null,
): DataSourceResult<ScheduleBooking[]> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(SCHEDULE_BOOKINGS, {
    variables: { documentId: documentId ?? "", date: date ?? null },
    skip: USE_MOCKS || !documentId || !date,
  });
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockedValue(
      documentId ? MOCK_SCHEDULE_BOOKINGS[documentId] ?? [] : [],
    );
  }
  if (!documentId || !date) {
    return { data: null, loading: false, error: null };
  }
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const list = q.data?.scheduleBookings ?? [];
  return {
    data: list.filter((b): b is NonNullable<typeof b> => !!b).map(mapBooking),
    loading: false,
    error: null,
    refetch: () => q.refetch(),
  };
}

/**
 * Check-in mutation. Returns the Apollo mutation tuple so callers can
 * track loading/error state per-row in a roster.
 */
export function useCheckInBooking() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation(CHECK_IN_BOOKING, {
    refetchQueries: [
      "ScheduleBookings",
      "ScheduleWeek",
      "AdminDailyAttendance",
    ],
  });
}

/**
 * Generic booking-status update — used by daily attendance to mark
 * `missed` and to undo back to `confirmed` from any final state.
 */
export function useUpdateBookingStatus() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation(UPDATE_BOOKING_STATUS, {
    refetchQueries: [
      "ScheduleBookings",
      "ScheduleWeek",
      "AdminDailyAttendance",
    ],
  });
}

export function useDailyAttendance(
  date: string,
): DataSourceResult<DailyAttendanceData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(DAILY_ATTENDANCE, {
    variables: { date },
    skip: USE_MOCKS || !date,
  });
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockedValue({
      ...MOCK_DAILY_ATTENDANCE,
      date,
    });
  }
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const a = q.data?.dailyAttendance;
  if (!a) return { data: null, loading: false, error: null };
  return { data: mapDailyAttendance(a), loading: false, error: null };
}

export function useAcademy(): DataSourceResult<AcademySettings> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(MY_ACADEMY, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_ACADEMY);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const a = q.data?.me?.academy;
  if (!a) return { data: null, loading: false, error: null };
  return { data: mapAcademy(a), loading: false, error: null };
}

/**
 * Returns the authenticated user's profile (name, role label, photo).
 * Shares the MyAcademy network round-trip via Apollo's query dedup, so
 * placing this hook alongside useAcademy() in the same tree is free.
 */
export function useMe(): DataSourceResult<MeProfile> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(MY_ACADEMY, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_ME);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const me = q.data?.me;
  if (!me) return { data: null, loading: false, error: null };
  return { data: mapMe(me), loading: false, error: null };
}

export interface LoginAcademyBranding {
  name: string;
  slug: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  logoSquareUrl: string | null;
}

/**
 * Public lookup used by /login to brand the page before any JWT exists.
 * Returns null when slug is null/empty or when the academy isn't found.
 */
export function useAcademyBranding(
  slug: string | null,
): DataSourceResult<LoginAcademyBranding> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(ACADEMY_BY_SLUG, {
    variables: { slug: slug ?? "" },
    skip: !slug || USE_MOCKS,
  });
  if (!slug) return { data: null, loading: false, error: null };
  if (USE_MOCKS) return { data: null, loading: false, error: null };
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const a = q.data?.academyBySlug;
  if (!a) return { data: null, loading: false, error: null };
  return {
    data: {
      name: a.name,
      slug: a.slug,
      primaryColor: a.primaryColor ?? null,
      secondaryColor: a.secondaryColor ?? null,
      logoUrl: a.logo?.url ?? null,
      logoSquareUrl: a.logoSquare?.url ?? null,
    },
    loading: false,
    error: null,
  };
}

export interface UpdateAcademyInput {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  address?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logo?: string | null; // documentId of Media, or null to detach
  logoSquare?: string | null;
}

/**
 * Updates the caller's academy. Mutation refetches MY_ACADEMY on success so
 * the cached AcademySettings (and the AcademyThemeProvider that reads it)
 * see the new values without a manual refetch.
 */
export function useUpdateAcademy() {
  const [mutate, state] = useMutation(UPDATE_ACADEMY, {
    refetchQueries: [{ query: MY_ACADEMY }],
    awaitRefetchQueries: true,
  });

  async function update(documentId: string, data: UpdateAcademyInput) {
    if (USE_MOCKS) return; // demo mode: no-op
    await mutate({ variables: { documentId, data } });
  }

  return { update, loading: state.loading, error: state.error ?? null };
}

export function useDRE(): DataSourceResult<DREData> {
  // cache-and-network: ao voltar da página de Financeiro pro DRE,
  // a query roda de novo em background ainda que o cache esteja
  // populado — caso contrário um "Marcar como pago" feito no
  // /admin/finance só seria refletido após hard reload, porque
  // refetchQueries({ include: [...] }) só refeta queries que
  // estão observed naquele instante.
  const q = useQuery(DRE_OVERVIEW, {
    skip: USE_MOCKS,
    fetchPolicy: "cache-and-network",
  });
  if (USE_MOCKS) return useMockedValue(MOCK_DRE);
  if (q.loading && !q.data) return loadingResult();
  if (q.error) return errorResult(q.error);
  const d = q.data?.dreOverview;
  if (!d) return { data: null, loading: false, error: null };
  return { data: mapDRE(d), loading: false, error: null };
}

export function useDependents(): DataSourceResult<GuardianFamily[]> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(GUARDIANS, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_FAMILIES);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  return {
    data: mapGuardians(q.data?.guardians ?? null),
    loading: false,
    error: null,
  };
}

export function useWorkouts(): DataSourceResult<WorkoutsData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(ADMIN_WORKOUTS, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_WORKOUTS);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  return {
    data: mapWorkouts(q.data?.workoutPlans ?? null),
    loading: false,
    error: null,
  };
}

export function useMembershipPlans(): DataSourceResult<PlansData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(ADMIN_PLANS, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_PLANS);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  return {
    data: mapMembershipPlans(q.data?.plans ?? null),
    loading: false,
    error: null,
  };
}
