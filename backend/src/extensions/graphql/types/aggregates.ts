/**
 * Aggregate resolvers — one-shot payloads that power entire admin pages.
 *
 * These resolvers compose existing content types (no new tables) and
 * shape the result to match the DataSourceResult<T> shapes the
 * frontend already uses in mock mode. This keeps the website hooks as
 * thin mappers: useX() just returns { data, loading, error } after a
 * single GraphQL round-trip.
 *
 * Queries exposed:
 *   - adminDashboard        → /admin/dashboard
 *   - financeOverview(m, y) → /admin/finance
 *   - dreOverview(m, y)     → /admin/dre
 *   - scheduleWeek(start)   → /admin/schedule
 *   - guardians             → /admin/dependents
 *
 * All are auth-scoped to the caller's academy via resolveUserAcademyId.
 */

import type { Core } from '@strapi/strapi';
import {
  resolveUserAcademyId,
  withAcademyScope,
  withPaymentScope,
} from '../helpers';
import {
  BRL,
  BRL_SHORT,
  CATEGORY_LABEL,
  MONTH_LABELS_PT,
  MONTH_SHORT_PT,
  fmtDateBR,
  initialsFor,
  monthWindow,
} from '../aggregate-helpers';

const STUDENT = 'api::student.student';
const SCHEDULE = 'api::class-schedule.class-schedule';
const BOOKING = 'api::class-booking.class-booking';
const PAYMENT = 'api::payment.payment';
const EXPENSE = 'api::expense.expense';

const WEEKDAY_LABEL_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

// ---------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------

export function buildAggregates({
  nexus,
  strapi,
}: {
  nexus: any;
  strapi: Core.Strapi;
}) {
  // ----- Object types ----------------------------------------------

  const MetricDelta = nexus.objectType({
    name: 'MetricDelta',
    definition(t: any) {
      t.nonNull.string('value');
      t.nonNull.string('trend'); // up|down|flat
    },
  });

  const MetricCard = nexus.objectType({
    name: 'MetricCard',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('label');
      t.nonNull.string('value');
      t.field('delta', { type: 'MetricDelta' });
      t.boolean('highlighted');
    },
  });

  const DashboardStudentRow = nexus.objectType({
    name: 'DashboardStudentRow',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('name');
      t.nonNull.string('email');
      t.nonNull.string('plan');
      t.nonNull.string('status');
      t.nonNull.string('initials');
      t.string('joinedAt');
    },
  });

  const DashboardClassRow = nexus.objectType({
    name: 'DashboardClassRow',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('name');
      t.string('instructor');
      t.nonNull.string('time');
      t.nonNull.int('booked');
      t.nonNull.int('capacity');
    },
  });

  const DashboardPaymentRow = nexus.objectType({
    name: 'DashboardPaymentRow',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('student');
      t.nonNull.string('amount');
      t.nonNull.string('dueDate');
      t.nonNull.string('method');
    },
  });

  const AdminDashboard = nexus.objectType({
    name: 'AdminDashboard',
    definition(t: any) {
      t.nonNull.list.nonNull.field('metrics', { type: 'MetricCard' });
      t.nonNull.list.nonNull.field('recentStudents', {
        type: 'DashboardStudentRow',
      });
      t.nonNull.list.nonNull.field('todayClasses', {
        type: 'DashboardClassRow',
      });
      t.nonNull.list.nonNull.field('upcomingPayments', {
        type: 'DashboardPaymentRow',
      });
    },
  });

  const FinanceCharge = nexus.objectType({
    name: 'FinanceCharge',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('student');
      t.nonNull.string('studentInitials');
      t.nonNull.float('amount');
      t.nonNull.string('amountFormatted');
      t.nonNull.string('method');
      t.nonNull.string('status');
      t.nonNull.string('dueDate');
      t.string('paidAt');
    },
  });

  const FinanceMethodRow = nexus.objectType({
    name: 'FinanceMethodRow',
    definition(t: any) {
      t.nonNull.string('method');
      t.nonNull.string('label');
      t.nonNull.string('amount');
      t.nonNull.int('percent');
    },
  });

  const FinanceOverview = nexus.objectType({
    name: 'FinanceOverview',
    definition(t: any) {
      t.nonNull.list.nonNull.field('kpis', { type: 'MetricCard' });
      t.nonNull.list.nonNull.field('charges', { type: 'FinanceCharge' });
      t.nonNull.list.nonNull.field('methodBreakdown', {
        type: 'FinanceMethodRow',
      });
    },
  });

  const DREHeroRevenue = nexus.objectType({
    name: 'DREHeroRevenue',
    definition(t: any) {
      t.nonNull.string('total');
      t.nonNull.string('deltaLabel');
      t.nonNull.string('trend');
    },
  });

  const DREHeroExpenses = nexus.objectType({
    name: 'DREHeroExpenses',
    definition(t: any) {
      t.nonNull.string('total');
      t.nonNull.string('fixed');
      t.nonNull.string('variable');
    },
  });

  const DREHeroProfit = nexus.objectType({
    name: 'DREHeroProfit',
    definition(t: any) {
      t.nonNull.string('total');
      t.nonNull.float('marginPercent');
    },
  });

  const DRECashFlowPoint = nexus.objectType({
    name: 'DRECashFlowPoint',
    definition(t: any) {
      t.nonNull.string('label');
      t.nonNull.float('revenue');
      t.nonNull.float('expenses');
      t.nonNull.float('profit');
    },
  });

  const DRECategoryBreakdown = nexus.objectType({
    name: 'DRECategoryBreakdown',
    definition(t: any) {
      t.nonNull.string('category');
      t.nonNull.string('label');
      t.nonNull.string('amount');
      t.nonNull.float('percent');
    },
  });

  const DREExpenseRow = nexus.objectType({
    name: 'DREExpenseRow',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('description');
      t.string('subtitle');
      t.nonNull.string('category');
      t.nonNull.string('categoryLabel');
      t.nonNull.string('type');
      t.nonNull.string('dueDate');
      t.nonNull.string('amount');
      t.nonNull.string('status');
    },
  });

  const DREOverview = nexus.objectType({
    name: 'DREOverview',
    definition(t: any) {
      t.nonNull.string('monthLabel');
      t.nonNull.field('revenue', { type: 'DREHeroRevenue' });
      t.nonNull.field('expenses', { type: 'DREHeroExpenses' });
      t.nonNull.field('profit', { type: 'DREHeroProfit' });
      t.nonNull.list.nonNull.field('cashFlow', { type: 'DRECashFlowPoint' });
      t.nonNull.list.nonNull.field('categoryBreakdown', {
        type: 'DRECategoryBreakdown',
      });
      t.nonNull.string('expensesTotalLabel');
      t.nonNull.list.nonNull.field('expenseRows', { type: 'DREExpenseRow' });
    },
  });

  const ScheduleClass = nexus.objectType({
    name: 'ScheduleClass',
    definition(t: any) {
      // Synthetic id (`<scheduleDocumentId>-<weekday>`) — unique per
      // (schedule × weekday) so the grid can `key={id}`. Use
      // `scheduleDocumentId` when calling scheduleBookings/checkIn.
      t.nonNull.string('id');
      t.nonNull.id('scheduleDocumentId');
      t.nonNull.string('name');
      t.string('instructor');
      t.string('modality'); // 'presential' | 'online' | null
      t.nonNull.int('weekday'); // 0=Sunday
      t.nonNull.string('startTime');
      t.nonNull.string('endTime');
      t.nonNull.int('booked');
      t.nonNull.int('capacity');
      t.nonNull.string('color');
    },
  });

  const ScheduleStats = nexus.objectType({
    name: 'ScheduleStats',
    definition(t: any) {
      t.nonNull.int('totalClasses');
      t.nonNull.int('totalBookings');
      t.nonNull.int('capacityFill');
    },
  });

  const ScheduleUpcoming = nexus.objectType({
    name: 'ScheduleUpcoming',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('name');
      t.nonNull.string('time');
      t.string('instructor');
    },
  });

  const ScheduleWeek = nexus.objectType({
    name: 'ScheduleWeek',
    definition(t: any) {
      t.nonNull.string('weekLabel');
      t.nonNull.int('weekNumber');
      t.nonNull.list.nonNull.field('classes', { type: 'ScheduleClass' });
      t.nonNull.field('stats', { type: 'ScheduleStats' });
      t.nonNull.list.nonNull.field('upcoming', { type: 'ScheduleUpcoming' });
    },
  });

  const GuardianFamilyGuardian = nexus.objectType({
    name: 'GuardianFamilyGuardian',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('name');
      t.nonNull.string('initials');
      t.nonNull.string('email');
      t.string('phone');
    },
  });

  const GuardianFamilyDependent = nexus.objectType({
    name: 'GuardianFamilyDependent',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('name');
      t.nonNull.int('age');
      t.string('className');
      t.string('classTime');
      t.nonNull.string('status');
      t.string('gender');
      t.string('medicalAlert');
    },
  });

  const GuardianFamily = nexus.objectType({
    name: 'GuardianFamily',
    definition(t: any) {
      t.nonNull.field('guardian', { type: 'GuardianFamilyGuardian' });
      t.nonNull.list.nonNull.field('dependents', {
        type: 'GuardianFamilyDependent',
      });
    },
  });

  const DailyAttendanceClass = nexus.objectType({
    name: 'DailyAttendanceClass',
    description:
      'A class occurring on a specific date with its booking roster, used by the daily attendance page.',
    definition(t: any) {
      t.nonNull.id('scheduleDocumentId');
      t.nonNull.string('name');
      t.string('instructor');
      t.string('room');
      t.nonNull.string('startTime');
      t.nonNull.string('endTime');
      t.int('capacity');
      t.nonNull.list.nonNull.field('bookings', { type: 'ClassBooking' });
      t.nonNull.int('bookedCount');
      t.nonNull.int('attendedCount');
      t.nonNull.int('missedCount');
    },
  });

  const DailyAttendance = nexus.objectType({
    name: 'DailyAttendance',
    description: 'Roster of all classes happening on a given date.',
    definition(t: any) {
      t.nonNull.string('date'); // ISO yyyy-mm-dd
      t.nonNull.string('weekdayLabel'); // PT-BR
      t.nonNull.list.nonNull.field('classes', { type: 'DailyAttendanceClass' });
    },
  });

  // ----- Query extension -------------------------------------------

  const queries = nexus.extendType({
    type: 'Query',
    definition(t: any) {
      // ----- adminDashboard ---------------------------------------
      t.field('adminDashboard', {
        type: 'AdminDashboard',
        resolve: async (_root: any, _args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const filters = withAcademyScope({}, academyId);

          const [students, schedules, payments] = await Promise.all([
            strapi.documents(STUDENT).findMany({
              // Exclude staff (academy_admin / instructor) from member metrics.
              filters: { ...filters, role: 'member' },
              sort: { createdAt: 'desc' },
              limit: 100,
              populate: { enrollments: { populate: { plan: true } } },
            }),
            strapi.documents(SCHEDULE).findMany({
              filters: { ...filters, isActive: true },
              limit: 100,
            }),
            strapi.documents(PAYMENT).findMany({
              filters: withPaymentScope(academyId),
              limit: 500,
              sort: { dueDate: 'desc' },
              populate: { enrollment: { populate: { student: true } } },
            }),
          ]);

          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const revenueThisMonth = payments
            .filter(
              (p: any) =>
                p.status === 'paid' &&
                p.paidAt &&
                new Date(p.paidAt) >= monthStart,
            )
            .reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);

          const overdueAmount = payments
            .filter((p: any) => p.status === 'overdue')
            .reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);

          const todayWeekday = now.getDay();
          const todayClasses = (schedules as any[])
            .filter((s) =>
              Array.isArray(s.weekdays)
                ? s.weekdays.includes(todayWeekday)
                : false,
            )
            .slice(0, 6)
            .map((s: any) => ({
              id: s.documentId,
              name: s.name,
              instructor: s.instructor,
              time: s.startTime ?? '',
              booked: 0, // bookings-for-today aggregation is expensive — defer
              capacity: s.maxCapacity ?? 0,
            }));

          const activeStudents = (students as any[]).filter(
            (s) => s.status === 'active',
          ).length;

          const metrics = [
            {
              id: 'students',
              label: 'Alunos ativos',
              value: String(activeStudents),
              delta: null,
              highlighted: false,
            },
            {
              id: 'mrr',
              label: 'Receita do mês',
              value: BRL_SHORT(revenueThisMonth),
              delta: null,
              highlighted: false,
            },
            {
              id: 'overdue',
              label: 'Em atraso',
              value: BRL_SHORT(overdueAmount),
              delta: null,
              highlighted: false,
            },
            {
              id: 'classes',
              label: 'Aulas hoje',
              value: String(todayClasses.length),
              delta: null,
              highlighted: false,
            },
          ];

          const recentStudents = (students as any[]).slice(0, 5).map((s: any) => ({
            id: s.documentId,
            name: s.name,
            email: s.email,
            plan: s.enrollments?.[0]?.plan?.name ?? '—',
            status: s.status,
            initials: initialsFor(s.name),
            joinedAt: s.createdAt ? fmtDateBR(s.createdAt) : null,
          }));

          const upcomingPayments = (payments as any[])
            .filter((p: any) => p.status === 'pending')
            .slice(0, 5)
            .map((p: any) => ({
              id: p.documentId,
              student: p.enrollment?.student?.name ?? '—',
              amount: BRL(Number(p.amount ?? 0)),
              dueDate: fmtDateBR(p.dueDate),
              method: p.method ?? 'pix',
            }));

          return {
            metrics,
            recentStudents,
            todayClasses,
            upcomingPayments,
          };
        },
      });

      // ----- financeOverview --------------------------------------
      t.field('financeOverview', {
        type: 'FinanceOverview',
        args: {
          month: nexus.intArg(),
          year: nexus.intArg(),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const now = new Date();
          const year = args.year ?? now.getFullYear();
          const month = args.month ?? now.getMonth() + 1;
          const { start, end } = monthWindow(year, month);

          const payments = await strapi.documents(PAYMENT).findMany({
            filters: withPaymentScope(academyId),
            limit: 2000,
            sort: { dueDate: 'desc' },
            populate: { enrollment: { populate: { student: true } } },
          });

          const inMonth = (p: any): boolean => {
            const d = p.dueDate;
            return d && d >= start && d < end;
          };

          const prev = month === 1 ? { m: 12, y: year - 1 } : { m: month - 1, y: year };
          const prevWindow = monthWindow(prev.y, prev.m);

          const revenue = payments
            .filter((p: any) => p.status === 'paid' && inMonth(p))
            .reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);
          const revenuePrev = payments
            .filter((p: any) => p.status === 'paid' && p.dueDate >= prevWindow.start && p.dueDate < prevWindow.end)
            .reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);
          const revenueDeltaPct = revenuePrev > 0 ? ((revenue - revenuePrev) / revenuePrev) * 100 : 0;
          const revenueDeltaLabel = revenuePrev > 0
            ? `${revenueDeltaPct >= 0 ? '+' : ''}${revenueDeltaPct.toFixed(1)}% vs ${MONTH_SHORT_PT[prev.m - 1]}`
            : 'Primeiro mês';

          const overduePayments = payments.filter((p: any) => p.status === 'overdue' && inMonth(p));
          const overdue = overduePayments.reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);

          const todayIso = new Date().toISOString().slice(0, 10);
          const processedTodayPayments = payments.filter((p: any) => p.paidAt?.slice(0, 10) === todayIso);
          const processedToday = processedTodayPayments.reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);

          const pendingMonth = payments.filter(
            (p: any) => p.status === 'pending' && inMonth(p),
          ).length;

          const kpis = [
            {
              id: 'revenue',
              label: 'Receita do mês',
              value: BRL(revenue),
              delta: { value: revenueDeltaLabel, trend: revenueDeltaPct >= 0 ? 'up' : 'down' },
              highlighted: true,
            },
            {
              id: 'overdue',
              label: 'Em atraso',
              value: BRL(overdue),
              delta: { value: `${overduePayments.length} cobranças`, trend: 'down' },
              highlighted: false,
            },
            {
              id: 'processed',
              label: 'Processado hoje',
              value: BRL(processedToday),
              delta: { value: `${processedTodayPayments.length} pagamentos`, trend: processedTodayPayments.length > 0 ? 'up' : 'flat' },
              highlighted: false,
            },
            {
              id: 'projection',
              label: 'Pendentes do mês',
              value: String(pendingMonth),
              delta: null,
              highlighted: false,
            },
          ];

          const charges = (payments as any[])
            .filter(inMonth)
            .slice(0, 20)
            .map((p: any) => {
              const name = p.enrollment?.student?.name ?? '—';
              const amount = Number(p.amount ?? 0);
              return {
                id: p.documentId,
                student: name,
                studentInitials: initialsFor(name),
                amount,
                amountFormatted: BRL(amount),
                method: p.method ?? 'pix',
                status: p.status ?? 'pending',
                dueDate: fmtDateBR(p.dueDate),
                paidAt: p.paidAt ? fmtDateBR(p.paidAt) : null,
              };
            });

          const methodTotals: Record<string, number> = { pix: 0, credit_card: 0, boleto: 0 };
          payments
            .filter((p: any) => p.status === 'paid' && inMonth(p))
            .forEach((p: any) => {
              const key = (p.method ?? 'pix') as string;
              methodTotals[key] = (methodTotals[key] ?? 0) + Number(p.amount ?? 0);
            });
          const methodSum = Object.values(methodTotals).reduce(
            (a: number, b: number) => a + b,
            0,
          );
          const methodBreakdown = [
            { method: 'pix', label: 'PIX' },
            { method: 'credit_card', label: 'Cartão de crédito' },
            { method: 'boleto', label: 'Boleto' },
          ].map((m) => ({
            ...m,
            amount: BRL(methodTotals[m.method] ?? 0),
            percent:
              methodSum > 0
                ? Math.round(((methodTotals[m.method] ?? 0) / methodSum) * 100)
                : 0,
          }));

          return { kpis, charges, methodBreakdown };
        },
      });

      // ----- dreOverview ------------------------------------------
      t.field('dreOverview', {
        type: 'DREOverview',
        args: {
          month: nexus.intArg(),
          year: nexus.intArg(),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const now = new Date();
          const year = args.year ?? now.getFullYear();
          const month = args.month ?? now.getMonth() + 1;
          const monthLabel = `${MONTH_LABELS_PT[month - 1]} ${year}`;
          const { start, end } = monthWindow(year, month);
          const prev = month === 1 ? { m: 12, y: year - 1 } : { m: month - 1, y: year };
          const prevWindow = monthWindow(prev.y, prev.m);

          const [expenses, payments] = await Promise.all([
            strapi.documents(EXPENSE).findMany({
              filters: withAcademyScope({}, academyId),
              limit: 2000,
              sort: { date: 'desc' },
            }),
            strapi.documents(PAYMENT).findMany({
              filters: withPaymentScope(academyId),
              limit: 5000,
            }),
          ]);

          const sumPaidBetween = (s: string, e: string): number =>
            (payments as any[])
              .filter(
                (p) =>
                  p.status === 'paid' &&
                  p.paidAt &&
                  p.paidAt.slice(0, 10) >= s &&
                  p.paidAt.slice(0, 10) < e,
              )
              .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

          const sumExpensesBetween = (s: string, e: string): number =>
            (expenses as any[])
              .filter((x) => x.date && x.date >= s && x.date < e)
              .reduce((sum, x) => sum + Number(x.amount ?? 0), 0);

          const monthExpenses = (expenses as any[]).filter(
            (x) => x.date && x.date >= start && x.date < end,
          );
          const revenue = sumPaidBetween(start, end);
          const expensesTotal = monthExpenses.reduce(
            (s, x) => s + Number(x.amount ?? 0),
            0,
          );
          const fixedTotal = monthExpenses
            .filter((x) => x.type === 'fixed')
            .reduce((s, x) => s + Number(x.amount ?? 0), 0);
          const variableTotal = expensesTotal - fixedTotal;
          const profit = revenue - expensesTotal;
          const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
          const revenuePrev = sumPaidBetween(prevWindow.start, prevWindow.end);
          const deltaPercent =
            revenuePrev > 0
              ? ((revenue - revenuePrev) / revenuePrev) * 100
              : 0;
          const deltaLabel =
            revenuePrev > 0
              ? `${deltaPercent >= 0 ? '+' : ''}${deltaPercent.toFixed(1)}% vs ${MONTH_SHORT_PT[prev.m - 1]}`
              : 'Primeiro mês';
          const trend = deltaPercent >= 0 ? 'up' : 'down';

          // 6-month cashflow
          const cashFlow: Array<{
            label: string;
            revenue: number;
            expenses: number;
            profit: number;
          }> = [];
          for (let i = 5; i >= 0; i--) {
            const m = ((month - 1 - i) % 12 + 12) % 12;
            const y = year + Math.floor((month - 1 - i) / 12);
            const win = monthWindow(y, m + 1);
            const r = sumPaidBetween(win.start, win.end);
            const e = sumExpensesBetween(win.start, win.end);
            cashFlow.push({
              label: MONTH_SHORT_PT[m],
              revenue: r,
              expenses: e,
              profit: r - e,
            });
          }

          // Category breakdown
          const byCategory = new Map<string, number>();
          monthExpenses.forEach((x) => {
            const c = (x.category ?? 'other') as string;
            byCategory.set(c, (byCategory.get(c) ?? 0) + Number(x.amount ?? 0));
          });
          const categoryBreakdown = Array.from(byCategory.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amount]) => ({
              category: cat,
              label: CATEGORY_LABEL[cat] ?? cat,
              amount: BRL_SHORT(amount),
              percent:
                expensesTotal > 0 ? (amount / expensesTotal) * 100 : 0,
            }));

          const expenseRows = monthExpenses.map((x: any) => ({
            id: x.documentId,
            description: x.description,
            subtitle: x.subtitle ?? null,
            category: x.category,
            categoryLabel: CATEGORY_LABEL[x.category] ?? x.category,
            type: x.type,
            dueDate: fmtDateBR(x.dueDate ?? x.date),
            amount: BRL(Number(x.amount ?? 0)),
            status: x.status ?? 'open',
          }));

          return {
            monthLabel,
            revenue: {
              total: BRL_SHORT(revenue),
              deltaLabel,
              trend,
            },
            expenses: {
              total: BRL_SHORT(expensesTotal),
              fixed: BRL_SHORT(fixedTotal),
              variable: BRL_SHORT(variableTotal),
            },
            profit: {
              total: BRL_SHORT(profit),
              marginPercent: Number(margin.toFixed(1)),
            },
            cashFlow,
            categoryBreakdown,
            expensesTotalLabel: BRL_SHORT(expensesTotal),
            expenseRows,
          };
        },
      });

      // ----- scheduleWeek -----------------------------------------
      t.field('scheduleWeek', {
        type: 'ScheduleWeek',
        args: {
          weekStart: nexus.stringArg(),
        },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const schedules = await strapi.documents(SCHEDULE).findMany({
            filters: withAcademyScope({ isActive: true }, academyId),
            limit: 200,
            sort: { startTime: 'asc' },
          });

          const now = args.weekStart
            ? new Date(args.weekStart + 'T00:00:00')
            : new Date();
          // Monday of the week
          const monday = new Date(now);
          monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          const weekLabel = `${String(monday.getDate()).padStart(2, '0')} – ${String(
            sunday.getDate(),
          ).padStart(2, '0')} de ${MONTH_LABELS_PT[monday.getMonth()].toLowerCase()}, ${monday.getFullYear()}`;

          // Rough ISO week number
          const jan1 = new Date(monday.getFullYear(), 0, 1);
          const weekNumber = Math.ceil(
            ((monday.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) /
              7,
          );

          const COLORS = ['flame', 'ink', 'pine'] as const;
          const classes: any[] = [];
          (schedules as any[]).forEach((s: any, idx: number) => {
            const color = COLORS[idx % COLORS.length];
            const weekdays: number[] = Array.isArray(s.weekdays) ? s.weekdays : [];
            weekdays.forEach((w: number) => {
              classes.push({
                id: `${s.documentId}-${w}`,
                scheduleDocumentId: s.documentId,
                name: s.name,
                instructor: s.instructor,
                modality: s.modality ?? null,
                weekday: w,
                startTime: s.startTime,
                endTime: s.endTime,
                booked: 0,
                capacity: s.maxCapacity ?? 0,
                color,
              });
            });
          });

          const totalClasses = classes.length;
          const totalCapacity = classes.reduce(
            (s, c) => s + (c.capacity ?? 0),
            0,
          );
          const totalBookings = 0;
          const capacityFill =
            totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;

          const upcoming = classes
            .filter((c) => c.weekday === new Date().getDay())
            .slice(0, 4)
            .map((c) => ({
              id: c.id,
              name: c.name,
              time: `Hoje, ${c.startTime}`,
              instructor: c.instructor ?? null,
            }));

          return {
            weekLabel,
            weekNumber,
            classes,
            stats: { totalClasses, totalBookings, capacityFill },
            upcoming,
          };
        },
      });

      // ----- dailyAttendance --------------------------------------
      t.field('dailyAttendance', {
        type: 'DailyAttendance',
        description:
          'Returns every active class scheduled to occur on the given date with its booking roster, ordered by startTime.',
        args: { date: nexus.nonNull(nexus.stringArg()) },
        resolve: async (_root: any, args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const dateIso: string = args.date;
          // Parse as local-noon to dodge DST/UTC edge cases — we only
          // care about the weekday integer.
          const weekday = new Date(`${dateIso}T12:00:00`).getDay();

          const schedules: any[] = await strapi.documents(SCHEDULE).findMany({
            filters: withAcademyScope({ isActive: true }, academyId),
            limit: 200,
            sort: { startTime: 'asc' },
          });

          // Filter to schedules whose recurrence includes this weekday.
          const todays = schedules.filter((s: any) =>
            Array.isArray(s.weekdays) && s.weekdays.includes(weekday),
          );

          // Bookings are fetched per-schedule. Could be a single $or
          // query, but the schedule count per academy is small enough
          // that the readability win beats the round-trip count.
          const classes = await Promise.all(
            todays.map(async (s: any) => {
              const bookings: any[] = await strapi
                .documents(BOOKING)
                .findMany({
                  filters: {
                    classSchedule: { documentId: s.documentId },
                    date: dateIso,
                  },
                  populate: { student: { populate: { photo: true } } },
                  sort: { createdAt: 'asc' },
                });
              const attendedCount = bookings.filter(
                (b) => b.status === 'attended',
              ).length;
              const missedCount = bookings.filter(
                (b) => b.status === 'missed',
              ).length;
              return {
                scheduleDocumentId: s.documentId,
                name: s.name,
                instructor: s.instructor ?? null,
                room: s.room ?? null,
                startTime: s.startTime,
                endTime: s.endTime,
                capacity: s.maxCapacity ?? null,
                bookings,
                bookedCount: bookings.length,
                attendedCount,
                missedCount,
              };
            }),
          );

          return {
            date: dateIso,
            weekdayLabel: WEEKDAY_LABEL_PT[weekday] ?? '',
            classes,
          };
        },
      });

      // ----- guardians (families) ---------------------------------
      t.list.nonNull.field('guardians', {
        type: 'GuardianFamily',
        resolve: async (_root: any, _args: any, ctx: any) => {
          const academyId = await resolveUserAcademyId(strapi, ctx);
          const guardians = await strapi.documents(STUDENT).findMany({
            filters: withAcademyScope({ isGuardian: true }, academyId),
            limit: 200,
            sort: { name: 'asc' },
            populate: {
              dependents: {
                populate: { enrollments: { populate: { plan: true } } },
              },
            },
          });

          const todayIso = new Date();
          return (guardians as any[]).map((g: any) => ({
            guardian: {
              id: g.documentId,
              name: g.name,
              initials: initialsFor(g.name),
              email: g.email,
              phone: g.phone ?? null,
            },
            dependents: (g.dependents ?? []).map((d: any) => {
              const bd = d.birthdate ? new Date(d.birthdate) : null;
              const age = bd
                ? Math.floor(
                    (todayIso.getTime() - bd.getTime()) / (365.25 * 86_400_000),
                  )
                : 0;
              const className = d.enrollments?.[0]?.plan?.name ?? null;
              return {
                id: d.documentId,
                name: d.name,
                age,
                className,
                classTime: null,
                status: d.status,
                gender: d.gender ?? null,
                medicalAlert: d.medicalAlert ?? null,
              };
            }),
          }));
        },
      });
    },
  });

  return {
    types: [
      MetricDelta,
      MetricCard,
      DashboardStudentRow,
      DashboardClassRow,
      DashboardPaymentRow,
      AdminDashboard,
      FinanceCharge,
      FinanceMethodRow,
      FinanceOverview,
      DREHeroRevenue,
      DREHeroExpenses,
      DREHeroProfit,
      DRECashFlowPoint,
      DRECategoryBreakdown,
      DREExpenseRow,
      DREOverview,
      ScheduleClass,
      ScheduleStats,
      ScheduleUpcoming,
      ScheduleWeek,
      DailyAttendanceClass,
      DailyAttendance,
      GuardianFamilyGuardian,
      GuardianFamilyDependent,
      GuardianFamily,
      queries,
    ],
    resolversConfig: {
      'Query.adminDashboard': { auth: true },
      'Query.financeOverview': { auth: true },
      'Query.dreOverview': { auth: true },
      'Query.scheduleWeek': { auth: true },
      'Query.dailyAttendance': { auth: true },
      'Query.guardians': { auth: true },
    },
  };
}
