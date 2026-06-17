/**
 * Unit tests for the Payment resolver's pure helpers — ownership and
 * next-charge selection. The resolver wiring (gateway calls, scope
 * filters) is exercised by the live smoke test, not here.
 */

import { describe, expect, it } from 'vitest';
import { paymentOwnedByStudent, selectNextPayment } from './payment';

describe('paymentOwnedByStudent', () => {
  const me = 'stu_me';

  it('matches a direct student link', () => {
    expect(paymentOwnedByStudent({ student: { documentId: me } }, me)).toBe(true);
  });

  it('matches via the enrollment student', () => {
    expect(
      paymentOwnedByStudent({ enrollment: { student: { documentId: me } } }, me),
    ).toBe(true);
  });

  it('rejects another student', () => {
    expect(
      paymentOwnedByStudent({ student: { documentId: 'stu_other' } }, me),
    ).toBe(false);
  });

  it('rejects null / missing', () => {
    expect(paymentOwnedByStudent(null, me)).toBe(false);
    expect(paymentOwnedByStudent({}, me)).toBe(false);
    expect(paymentOwnedByStudent({ student: { documentId: me } }, '')).toBe(false);
  });
});

describe('selectNextPayment', () => {
  it('returns null when nothing is open', () => {
    expect(selectNextPayment([])).toBeNull();
    expect(
      selectNextPayment([{ status: 'paid', dueDate: '2026-01-01' }]),
    ).toBeNull();
  });

  it('picks the earliest unpaid charge', () => {
    const next = selectNextPayment([
      { status: 'paid', dueDate: '2026-01-01' },
      { status: 'pending', dueDate: '2026-07-15' },
      { status: 'overdue', dueDate: '2026-05-10' },
      { status: 'pending', dueDate: '2026-06-20' },
    ]);
    expect(next.dueDate).toBe('2026-05-10');
  });

  it('counts both pending and overdue as open', () => {
    expect(selectNextPayment([{ status: 'overdue', dueDate: '2026-03-01' }]).dueDate).toBe(
      '2026-03-01',
    );
  });
});
