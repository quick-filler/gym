import { describe, expect, it } from 'vitest';
import {
  addBillingCycle,
  computeEnrollmentStatus,
  computeNextCharge,
} from './enrollment';

describe('addBillingCycle', () => {
  it('monthly adds 1 month, quarterly 3, annual 12', () => {
    expect(addBillingCycle('2026-06-26', 'monthly')).toBe('2026-07-26');
    expect(addBillingCycle('2026-06-26', 'quarterly')).toBe('2026-09-26');
    expect(addBillingCycle('2026-06-26', 'annual')).toBe('2027-06-26');
  });
});

describe('computeNextCharge', () => {
  const base = { startDate: '2026-06-26', billingCycle: 'monthly', planPrice: 200 };

  it('no payments → one cycle after startDate, em_dia when far out', () => {
    const r = computeNextCharge({ ...base, payments: [], today: '2026-06-26' });
    expect(r.date).toBe('2026-07-26');
    expect(r.amount).toBe(200);
    expect(r.status).toBe('em_dia');
  });

  it('pendente in the week before the charge date', () => {
    const r = computeNextCharge({ ...base, payments: [], today: '2026-07-20' });
    expect(r.date).toBe('2026-07-26');
    expect(r.status).toBe('pendente');
  });

  it('atrasado once the derived date passed unpaid', () => {
    const r = computeNextCharge({ ...base, payments: [], today: '2026-07-27' });
    expect(r.status).toBe('atrasado');
  });

  it('uses the earliest open charge when one exists', () => {
    const r = computeNextCharge({
      ...base,
      payments: [
        { status: 'paid', dueDate: '2026-06-26', amount: 200 },
        { status: 'pending', dueDate: '2026-07-26', amount: 200 },
      ],
      today: '2026-06-26',
    });
    expect(r.date).toBe('2026-07-26');
    expect(r.amount).toBe(200);
    expect(r.status).toBe('em_dia');
  });

  it('anchors on the last paid charge when nothing is open', () => {
    const r = computeNextCharge({
      ...base,
      payments: [
        { status: 'paid', dueDate: '2026-05-26', amount: 200 },
        { status: 'paid', dueDate: '2026-06-26', amount: 200 },
      ],
      today: '2026-06-26',
    });
    expect(r.date).toBe('2026-07-26'); // last paid (Jun) + 1 cycle
    expect(r.status).toBe('em_dia');
  });
});

// Pin "today" relative to the test's TZ-derived current date by computing
// dates around it. We use fixed far-past / far-future dates so the test is
// stable regardless of when it runs.
const PAST = '2000-01-01';
const FUTURE = '2999-12-31';

describe('computeEnrollmentStatus', () => {
  it('returns em_dia when there are no payments', () => {
    expect(computeEnrollmentStatus([])).toBe('em_dia');
  });

  it('returns em_dia when all payments are paid', () => {
    expect(
      computeEnrollmentStatus([
        { status: 'paid', dueDate: PAST },
        { status: 'paid', dueDate: FUTURE },
      ]),
    ).toBe('em_dia');
  });

  it('returns atrasado when any payment is overdue', () => {
    expect(
      computeEnrollmentStatus([
        { status: 'paid', dueDate: PAST },
        { status: 'overdue', dueDate: PAST },
      ]),
    ).toBe('atrasado');
  });

  it('returns atrasado when a pending payment is past its due date', () => {
    expect(
      computeEnrollmentStatus([{ status: 'pending', dueDate: PAST }]),
    ).toBe('atrasado');
  });

  it('returns pendente when a pending payment is not yet due', () => {
    expect(
      computeEnrollmentStatus([{ status: 'pending', dueDate: FUTURE }]),
    ).toBe('pendente');
  });

  it('prioritises atrasado over pendente', () => {
    expect(
      computeEnrollmentStatus([
        { status: 'pending', dueDate: FUTURE },
        { status: 'overdue', dueDate: PAST },
      ]),
    ).toBe('atrasado');
  });

  it('ignores cancelled payments', () => {
    expect(
      computeEnrollmentStatus([
        { status: 'cancelled', dueDate: PAST },
        { status: 'paid', dueDate: FUTURE },
      ]),
    ).toBe('em_dia');
  });
});
