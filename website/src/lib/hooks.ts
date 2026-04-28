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
import { useQuery } from "@apollo/client/react";
import { graphql } from "@/gql";
import { USE_MOCKS } from "./config";
import {
  MOCK_ACADEMY,
  MOCK_DASHBOARD,
  MOCK_DRE,
  MOCK_FAMILIES,
  MOCK_FINANCE,
  MOCK_PLANS,
  MOCK_PRICING_PLANS,
  MOCK_SCHEDULE,
  MOCK_STUDENTS,
  MOCK_WORKOUTS,
} from "./mock-data";
import {
  mapAcademy,
  mapDRE,
  mapDashboard,
  mapFinance,
  mapGuardians,
  mapMembershipPlans,
  mapPricingPlans,
  mapSchedule,
  mapStudents,
  mapWorkouts,
} from "./mappers";
import type {
  AcademySettings,
  DREData,
  DashboardData,
  DataSourceResult,
  FinanceData,
  GuardianFamily,
  PlansData,
  PricingPlan,
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

export function useFinance(): DataSourceResult<FinanceData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(FINANCE_OVERVIEW, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_FINANCE);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const f = q.data?.financeOverview;
  if (!f) return { data: null, loading: false, error: null };
  return { data: mapFinance(f), loading: false, error: null };
}

export function useSchedule(): DataSourceResult<ScheduleData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(SCHEDULE_WEEK, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_SCHEDULE);
  if (q.loading) return loadingResult();
  if (q.error) return errorResult(q.error);
  const s = q.data?.scheduleWeek;
  if (!s) return { data: null, loading: false, error: null };
  return { data: mapSchedule(s), loading: false, error: null };
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

export function useDRE(): DataSourceResult<DREData> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const q = useQuery(DRE_OVERVIEW, { skip: USE_MOCKS });
  if (USE_MOCKS) return useMockedValue(MOCK_DRE);
  if (q.loading) return loadingResult();
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
