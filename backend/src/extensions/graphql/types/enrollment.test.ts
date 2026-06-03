import { describe, expect, it } from 'vitest';
import { computeEnrollmentStatus } from './enrollment';

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
