/**
 * Scheduled reminder logic (Fase 7b) — runs from Strapi cron (config/server.ts)
 * and can be triggered manually via the `runNotificationReminders` mutation.
 *
 *   - remindUpcomingCharges: "Cobrança vence em 3/1 dia" (via the derived
 *     nextCharge, daily cron — exact-day match means one per reminder).
 *   - remindUpcomingClasses: "Sua aula começa em 1 hora" (every-15min cron,
 *     deduped per booking so it fires once).
 *
 * Pure helpers (chargeReminderKind / startsWithinMinutes) are unit-tested; the
 * runners are best-effort and never throw (notifications are non-critical).
 */

import type { Core } from '@strapi/strapi';
import { computeNextCharge } from '../extensions/graphql/types/enrollment';
import { classStartInstant } from '../extensions/graphql/types/student-schedule';
import { createInApp } from './notify';

const ENROLLMENT = 'api::enrollment.enrollment';
const BOOKING = 'api::class-booking.class-booking';

/* ---- pure helpers (unit-tested) ---- */

/** Adds `n` days to a yyyy-mm-dd date (UTC-safe). */
function addDays(dateISO: string, n: number): string {
  const d = new Date(`${dateISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Which charge reminder a due date warrants relative to `today`: 3 or 1 day out. */
export function chargeReminderKind(
  dueDate: string | null | undefined,
  today: string,
): 'due_3' | 'due_1' | null {
  if (!dueDate) return null;
  if (dueDate === addDays(today, 3)) return 'due_3';
  if (dueDate === addDays(today, 1)) return 'due_1';
  return null;
}

/** True when `start` is in the future and within `mins` minutes of `now`. */
export function startsWithinMinutes(
  start: Date | null,
  now: Date,
  mins: number,
): boolean {
  if (!start) return false;
  const diff = (start.getTime() - now.getTime()) / 60000;
  return diff > 0 && diff <= mins;
}

/** "HH:MM" in BRT for `now + minutes`. Used to window the class-reminder query. */
export function brtClockPlus(now: Date, minutes: number): string {
  const t = new Date(now.getTime() + minutes * 60000);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(t);
}

/* ---- runners (impure) ---- */

function todayBR(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

function brl(value: number): string {
  return `R$ ${Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Daily: notify students whose next charge is 3 or 1 day out. Returns count. */
export async function remindUpcomingCharges(strapi: Core.Strapi): Promise<number> {
  const today = todayBR();
  const enrollments: any[] = await strapi.db.query(ENROLLMENT).findMany({
    where: { status: 'active' },
    populate: {
      plan: true,
      payments: true,
      student: { populate: { user: true, academy: true } },
      dependent: { populate: { guardian: { populate: { user: true } }, academy: true } },
    },
  });
  let created = 0;
  for (const e of enrollments) {
    if (!e.plan) continue;
    const userId = e.student?.user?.id ?? e.dependent?.guardian?.user?.id;
    const academyId = e.student?.academy?.id ?? e.dependent?.academy?.id ?? null;
    if (!userId) continue;
    const nc = computeNextCharge({
      payments: (e.payments ?? []).map((p: any) => ({
        status: p.status,
        dueDate: p.dueDate,
        amount: p.amount,
      })),
      startDate: e.startDate,
      billingCycle: e.plan.billingCycle ?? 'monthly',
      planPrice: Number(e.plan.price ?? 0),
      today,
    });
    const kind = chargeReminderKind(nc.date, today);
    if (!kind) continue;
    const days = kind === 'due_3' ? 3 : 1;
    await createInApp(strapi, {
      userId,
      academyId,
      kind: 'payment_due',
      title: `Cobrança vence em ${days} dia${days === 1 ? '' : 's'}`,
      body: `${brl(nc.amount)} · vencimento ${nc.date.split('-').reverse().join('/')}`,
      data: { route: '/payment', dueDate: nc.date },
    });
    created += 1;
  }
  return created;
}

/**
 * Every 15min: notify booked students whose class starts within the next hour.
 *
 * Scales to thousands of bookings: the DB query is windowed to classes starting
 * in the next ~65min (via classSchedule.startTime) AND not yet reminded
 * (reminderSentAt IS NULL), so each tick scans only the handful entering the
 * hour window — no full-table scan, no per-booking dedupe query. The
 * `reminderSentAt` flag (set when we actually send) guarantees one per booking.
 */
export async function remindUpcomingClasses(strapi: Core.Strapi): Promise<number> {
  const today = todayBR();
  const now = new Date();
  const from = brtClockPlus(now, 0);
  let to = brtClockPlus(now, 65); // coarse prefilter; precise check below
  if (to < from) to = '23:59'; // near-midnight: don't wrap into tomorrow

  const bookings: any[] = await strapi.db.query(BOOKING).findMany({
    where: {
      date: today,
      status: 'confirmed',
      reminderSentAt: { $null: true },
      classSchedule: { startTime: { $gte: from, $lte: to } },
    },
    populate: {
      classSchedule: { populate: { academy: true } },
      student: { populate: { user: true } },
      dependent: { populate: { guardian: { populate: { user: true } } } },
    },
    limit: 2000,
  });

  let created = 0;
  for (const b of bookings) {
    const start = classStartInstant(b.date, b.classSchedule?.startTime);
    // Precise check (coarse window is +65min; only fire inside the real hour).
    if (!startsWithinMinutes(start, now, 60)) continue;

    // Mark first so a crash mid-loop never double-sends; only when truly sending.
    await strapi.db
      .query(BOOKING)
      .update({ where: { id: b.id }, data: { reminderSentAt: new Date() } });

    const userId = b.student?.user?.id ?? b.dependent?.guardian?.user?.id;
    if (!userId) continue;
    const who = b.dependent ? `${b.dependent.name} · ` : '';
    await createInApp(strapi, {
      userId,
      academyId: b.classSchedule?.academy?.id ?? null,
      kind: 'class_reminder',
      title: 'Sua aula começa em 1 hora',
      body: `${who}${b.classSchedule?.name ?? 'Aula'} às ${(b.classSchedule?.startTime ?? '').slice(0, 5)}`,
      data: { route: `/booking/${b.documentId}`, bookingId: b.documentId },
    });
    created += 1;
  }
  return created;
}
