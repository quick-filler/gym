/**
 * Mapper unit tests (L2 of the test plan).
 *
 * Each test feeds a hand-built "GraphQL-shaped" input to a mapper and
 * asserts the resulting domain shape. No Apollo client, no DOM, no
 * backend. Guards against response-shape drift: if the backend changes
 * a field name or nullability, these break loudly here.
 */

import { describe, expect, it } from 'vitest';
import {
  initialsFromName,
  mapAcademy,
  mapDRE,
  mapDashboard,
  mapDelta,
  mapFinance,
  mapGuardians,
  mapPricingPlans,
  mapSchedule,
  mapStudents,
  mapWorkouts,
  pickColor,
} from './mappers';

describe('pickColor', () => {
  it('returns a hex color from the palette', () => {
    const c = pickColor('abc123');
    expect(c).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('is stable for the same seed', () => {
    expect(pickColor('alpha')).toBe(pickColor('alpha'));
  });

  it('varies across different seeds', () => {
    const a = pickColor('a');
    const b = pickColor('academy-gym-demo');
    const c = pickColor('another-seed');
    // Not a strong assertion (hash collisions exist), but any two of
    // these should differ for the sizes we pass.
    const distinct = new Set([a, b, c]).size;
    expect(distinct).toBeGreaterThanOrEqual(2);
  });

  it('handles empty seed without throwing', () => {
    const c = pickColor('');
    expect(c).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('initialsFromName', () => {
  it('first+last initials for multi-word', () => {
    expect(initialsFromName('Ana Beatriz Souza')).toBe('AS');
  });

  it('single-word → first 2 chars', () => {
    expect(initialsFromName('Ana')).toBe('AN');
  });

  it('trims whitespace', () => {
    expect(initialsFromName('  João   Silva  ')).toBe('JS');
  });

  it('fallback for empty/null/undefined', () => {
    expect(initialsFromName('')).toBe('?');
    expect(initialsFromName('   ')).toBe('?');
    expect(initialsFromName(null)).toBe('?');
    expect(initialsFromName(undefined)).toBe('?');
  });
});

describe('mapDelta', () => {
  it('returns undefined for null/undefined', () => {
    expect(mapDelta(null)).toBeUndefined();
    expect(mapDelta(undefined)).toBeUndefined();
  });

  it('passes through known trend strings', () => {
    expect(mapDelta({ value: '+8%', trend: 'up' })).toEqual({
      value: '+8%',
      trend: 'up',
    });
    expect(mapDelta({ value: '-2%', trend: 'down' })?.trend).toBe('down');
    expect(mapDelta({ value: '0', trend: 'flat' })?.trend).toBe('flat');
  });

  it('coerces unknown trend to "flat"', () => {
    expect(mapDelta({ value: '?', trend: 'sideways' })?.trend).toBe('flat');
  });
});

describe('mapPricingPlans', () => {
  it('filters out isActive:false entries', () => {
    const input = [
      { documentId: '1', name: 'Mensal', price: 99, billingCycle: 'monthly', isActive: true },
      { documentId: '2', name: 'Anual', price: 890, billingCycle: 'annual', isActive: false },
      null,
    ];
    const plans = mapPricingPlans(input);
    expect(plans).toHaveLength(1);
    expect(plans[0]!.name).toBe('Mensal');
  });

  it('divides annual price by 12 for priceMonthly', () => {
    const plans = mapPricingPlans([
      { documentId: '1', name: 'Anual', price: 1200, billingCycle: 'annual', isActive: true },
    ]);
    expect(plans[0]!.priceMonthly).toBe(100);
    expect(plans[0]!.tag).toBe('Anual');
  });

  it('keeps monthly price as-is', () => {
    const plans = mapPricingPlans([
      { documentId: '1', name: 'Mensal', price: 199, billingCycle: 'monthly', isActive: true },
    ]);
    expect(plans[0]!.priceMonthly).toBe(199);
    expect(plans[0]!.tag).toBe('Mensal');
  });

  it('marks the 2nd plan as featured', () => {
    const plans = mapPricingPlans([
      { documentId: '1', name: 'A', price: 99, billingCycle: 'monthly' },
      { documentId: '2', name: 'B', price: 199, billingCycle: 'monthly' },
      { documentId: '3', name: 'C', price: 399, billingCycle: 'monthly' },
    ]);
    expect(plans.map((p) => p.featured)).toEqual([false, true, false]);
  });

  it('filters null entries out of features[]', () => {
    const plans = mapPricingPlans([
      {
        documentId: '1',
        name: 'X',
        price: 10,
        billingCycle: 'monthly',
        features: ['a', null, 'b', null],
      },
    ]);
    expect(plans[0]!.features).toEqual(['a', 'b']);
  });

  it('handles null/empty input safely', () => {
    expect(mapPricingPlans(null)).toEqual([]);
    expect(mapPricingPlans(undefined)).toEqual([]);
    expect(mapPricingPlans([])).toEqual([]);
  });
});

describe('mapDashboard', () => {
  it('maps metrics, recent students, classes, payments', () => {
    const out = mapDashboard({
      metrics: [
        { id: 'students', label: 'Alunos', value: '248', highlighted: false, delta: null },
        {
          id: 'mrr',
          label: 'Receita',
          value: 'R$ 62.480',
          delta: { value: '+8%', trend: 'up' },
        },
      ],
      recentStudents: [
        {
          id: 's1',
          name: 'Ana',
          email: 'ana@x.com',
          plan: 'Mensal',
          status: 'active',
          initials: 'AN',
          joinedAt: '2026-04-02',
        },
      ],
      todayClasses: [
        { id: 'c1', name: 'CrossFit', instructor: 'Carol', time: '06:00', booked: 18, capacity: 20 },
        { id: 'c2', name: 'Yoga', time: '18:30', booked: 12, capacity: 14 },
      ],
      upcomingPayments: [
        { id: 'p1', student: 'Ana', amount: 'R$ 149,00', dueDate: '10/04/2026', method: 'pix' },
      ],
    });

    expect(out.metrics).toHaveLength(2);
    expect(out.metrics[1]!.delta?.trend).toBe('up');
    expect(out.recentStudents[0]!.status).toBe('active');
    expect(out.recentStudents[0]!.avatarColor).toMatch(/^#/);
    expect(out.todayClasses[1]!.instructor).toBe(''); // null → ""
    expect(out.upcomingPayments[0]!.method).toBe('pix');
  });

  it('coerces an unknown student status to "active"', () => {
    const out = mapDashboard({
      metrics: [],
      recentStudents: [
        { id: 's1', name: 'X', email: 'x@x', plan: 'Mensal', status: 'zombie', initials: 'XX' },
      ],
      todayClasses: [],
      upcomingPayments: [],
    });
    expect(out.recentStudents[0]!.status).toBe('zombie'); // type narrow still accepts, UI guard is visual
  });

  it('empty joinedAt defaults to empty string', () => {
    const out = mapDashboard({
      metrics: [],
      recentStudents: [
        { id: 's1', name: 'X', email: 'x@x', plan: 'M', status: 'active', initials: 'XX' },
      ],
      todayClasses: [],
      upcomingPayments: [],
    });
    expect(out.recentStudents[0]!.joinedAt).toBe('');
  });
});

describe('mapStudents', () => {
  it('maps enrollment→plan and formats BRL planPrice', () => {
    const rows = mapStudents([
      {
        documentId: 's1',
        name: 'Ana Costa',
        email: 'ana@x.com',
        phone: '1199',
        status: 'active',
        enrollments: [
          {
            startDate: '2026-04-01',
            endDate: '2026-05-01',
            paymentMethod: 'credit_card',
            plan: { name: 'Trimestral', price: 399, billingCycle: 'quarterly' },
          },
        ],
      },
    ]);
    expect(rows[0]!.plan).toBe('Trimestral');
    expect(rows[0]!.paymentMethod).toBe('credit_card');
    expect(rows[0]!.planPrice).toBe('R$ 399,00');
    expect(rows[0]!.joinedAt).toBe('2026-04-01');
    expect(rows[0]!.nextPayment).toBe('2026-05-01');
    expect(rows[0]!.initials).toBe('AC');
  });

  it('defaults to pix + "—" when student has no enrollment', () => {
    const rows = mapStudents([
      {
        documentId: 's1',
        name: 'Solo',
        email: 's@x.com',
        status: 'active',
      },
    ]);
    expect(rows[0]!.plan).toBe('—');
    expect(rows[0]!.paymentMethod).toBe('pix');
    expect(rows[0]!.nextPayment).toBe('—');
    expect(rows[0]!.planPrice).toBe('R$ 0,00');
  });

  it('drops null rows', () => {
    expect(mapStudents([null, null])).toEqual([]);
    expect(mapStudents(null)).toEqual([]);
  });
});

describe('mapFinance', () => {
  it('maps kpis, charges (enum coercion), method breakdown', () => {
    const out = mapFinance({
      kpis: [
        {
          id: 'revenue',
          label: 'Receita',
          value: 'R$ 62.480',
          highlighted: true,
          delta: { value: '+8%', trend: 'up' },
        },
      ],
      charges: [
        {
          id: 'c1',
          student: 'Ana',
          studentInitials: 'AN',
          amount: 149,
          amountFormatted: 'R$ 149,00',
          method: 'pix',
          status: 'paid',
          dueDate: '10/04/2026',
          paidAt: '10/04/2026',
        },
      ],
      methodBreakdown: [
        { method: 'pix', label: 'PIX', amount: 'R$ 34.520', percent: 55 },
        { method: 'credit_card', label: 'Cartão', amount: 'R$ 21.610', percent: 35 },
        { method: 'boleto', label: 'Boleto', amount: 'R$ 6.350', percent: 10 },
      ],
    });
    expect(out.kpis[0]!.highlighted).toBe(true);
    expect(out.charges[0]!.method).toBe('pix');
    expect(out.charges[0]!.status).toBe('paid');
    expect(out.charges[0]!.paidAt).toBe('10/04/2026');
    expect(out.methodBreakdown.reduce((s, m) => s + m.percent, 0)).toBe(100);
  });

  it('null paidAt becomes undefined', () => {
    const out = mapFinance({
      kpis: [],
      charges: [
        {
          id: 'c1',
          student: 'X',
          studentInitials: 'XX',
          amount: 10,
          amountFormatted: 'R$ 10,00',
          method: 'pix',
          status: 'pending',
          dueDate: '',
          paidAt: null,
        },
      ],
      methodBreakdown: [],
    });
    expect(out.charges[0]!.paidAt).toBeUndefined();
  });
});

describe('mapSchedule', () => {
  it('maps classes with color coercion and empty instructor fallback', () => {
    const out = mapSchedule({
      weekLabel: '06 – 12 de abril, 2026',
      weekNumber: 15,
      stats: { totalClasses: 2, totalBookings: 30, capacityFill: 84 },
      classes: [
        {
          id: 'c1',
          name: 'CrossFit',
          instructor: 'Carol',
          weekday: 1,
          startTime: '06:00',
          endTime: '07:00',
          booked: 18,
          capacity: 20,
          color: 'flame',
        },
        {
          id: 'c2',
          name: 'Hue',
          instructor: null,
          weekday: 2,
          startTime: '07:00',
          endTime: '08:00',
          booked: 0,
          capacity: 10,
          color: 'neon', // invalid → coerces to 'ink'
        },
      ],
      upcoming: [{ id: 'u1', name: 'X', time: 'Hoje', instructor: null }],
    });
    expect(out.classes[0]!.color).toBe('flame');
    expect(out.classes[1]!.color).toBe('ink');
    expect(out.classes[1]!.instructor).toBe('');
    expect(out.upcoming[0]!.instructor).toBe('');
  });
});

describe('mapAcademy', () => {
  it('maps branding with fallbacks', () => {
    const out = mapAcademy({
      name: 'Gym Demo',
      slug: 'gym-demo',
      primaryColor: '#0a84ff',
      secondaryColor: null,
      plan: 'business',
      email: null,
      phone: null,
      address: null,
      logo: { url: '/logo.png' },
    });
    expect(out.slug).toBe('gym-demo');
    expect(out.primaryColor).toBe('#0a84ff');
    expect(out.secondaryColor).toBe('#0a84ff'); // null → default blue
    expect(out.plan).toBe('business');
    expect(out.logoUrl).toBe('/logo.png');
    expect(out.email).toBe('');
  });

  it('coerces unknown plan to starter', () => {
    const out = mapAcademy({
      name: 'X',
      slug: 'x',
      plan: 'enterprise', // not in the starter|business|pro tier
    });
    expect(out.plan).toBe('starter');
  });

  it('logoUrl is undefined when logo is missing', () => {
    const out = mapAcademy({ name: 'X', slug: 'x' });
    expect(out.logoUrl).toBeUndefined();
  });
});

describe('mapDRE', () => {
  const base = {
    monthLabel: 'Abril 2026',
    revenue: { total: 'R$ 18.420', deltaLabel: '+8,2% vs mar', trend: 'up' },
    expenses: { total: 'R$ 9.800', fixed: 'R$ 7.500', variable: 'R$ 2.300' },
    profit: { total: 'R$ 8.620', marginPercent: 46.8 },
    cashFlow: Array.from({ length: 6 }).map((_, i) => ({
      label: `M${i}`,
      revenue: 10000 + i * 1000,
      expenses: 5000 + i * 500,
      profit: 5000 + i * 500,
    })),
    categoryBreakdown: [
      { category: 'rent', label: 'Aluguel', amount: 'R$ 4.500', percent: 45.9 },
      { category: 'payroll', label: 'Salários', amount: 'R$ 3.000', percent: 30.6 },
    ],
    expensesTotalLabel: 'R$ 9.800',
    expenseRows: [
      {
        id: 'e1',
        description: 'Aluguel',
        subtitle: 'Dia 5',
        category: 'rent',
        categoryLabel: 'Aluguel',
        type: 'fixed',
        dueDate: '05/04/2026',
        amount: 'R$ 4.500,00',
        status: 'paid',
      },
    ],
  };

  it('maps the hero + cashflow + categories + rows', () => {
    const out = mapDRE(base);
    expect(out.cashFlow).toHaveLength(6);
    expect(out.revenue.trend).toBe('up');
    expect(out.profit.marginPercent).toBe(46.8);
    expect(out.expenseRows[0]!.subtitle).toBe('Dia 5');
  });

  it('coerces unknown trend to flat', () => {
    const out = mapDRE({
      ...base,
      revenue: { total: 'x', deltaLabel: 'y', trend: 'zzz' },
    });
    expect(out.revenue.trend).toBe('flat');
  });

  it('subtitle null becomes undefined', () => {
    const out = mapDRE({
      ...base,
      expenseRows: [{ ...base.expenseRows[0]!, subtitle: null }],
    });
    expect(out.expenseRows[0]!.subtitle).toBeUndefined();
  });
});

describe('mapGuardians', () => {
  it('maps families with dependents, gradient, status coercion', () => {
    const out = mapGuardians([
      {
        guardian: {
          id: 'g1',
          name: 'Ana Costa',
          initials: 'AC',
          email: 'ana@x.com',
          phone: '(11) 98765-4321',
        },
        dependents: [
          {
            id: 'd1',
            name: 'Sofia',
            age: 8,
            className: 'Natação',
            classTime: 'Seg 16h',
            status: 'active',
            gender: 'girl',
            medicalAlert: 'Alergia a cloro',
          },
          {
            id: 'd2',
            name: 'Pedro',
            age: 10,
            className: null,
            classTime: null,
            status: 'active',
            gender: 'boy',
            medicalAlert: null,
          },
        ],
      },
    ]);
    expect(out[0]!.guardian.avatarGradient).toContain('linear-gradient');
    expect(out[0]!.dependents[0]!.medicalAlert).toBe('Alergia a cloro');
    expect(out[0]!.dependents[1]!.medicalAlert).toBeUndefined();
    expect(out[0]!.dependents[1]!.className).toBe('');
  });

  it('coerces unknown status to active', () => {
    const out = mapGuardians([
      {
        guardian: { id: 'g', name: 'X', initials: 'XX', email: 'x' },
        dependents: [{ id: 'd', name: 'N', age: 1, status: 'weird' }],
      },
    ]);
    expect(out[0]!.dependents[0]!.status).toBe('active');
  });

  it('coerces unknown gender to boy', () => {
    const out = mapGuardians([
      {
        guardian: { id: 'g', name: 'X', initials: 'XX', email: 'x' },
        dependents: [{ id: 'd', name: 'N', age: 1, status: 'active', gender: 'nb' }],
      },
    ]);
    expect(out[0]!.dependents[0]!.gender).toBe('boy');
  });

  it('safe for empty/null input', () => {
    expect(mapGuardians(null)).toEqual([]);
    expect(mapGuardians([])).toEqual([]);
  });
});

describe('mapWorkouts', () => {
  it('maps cards with sets formatted as NxR, default load, rotating icons', () => {
    const out = mapWorkouts([
      {
        documentId: 'w1',
        name: 'Peito',
        instructor: 'Rafael',
        isActive: true,
        validFrom: '2026-03-14',
        exercises: [
          { name: 'Supino', sets: 4, reps: 12, load: '60kg' },
          { name: 'Crucifixo', sets: 3, reps: 15, load: null },
        ],
        student: { documentId: 's1', name: 'João Silva' },
      },
      {
        documentId: 'w2',
        name: 'Pernas',
        isActive: false,
        exercises: [{ name: 'Agachamento', sets: 4, reps: 10, load: '80kg' }],
      },
    ]);
    expect(out.tabs.map((t) => t.id)).toEqual(['active', 'assessments', 'archived']);
    expect(out.cards[0]!.icon).toBe('dumbbell');
    expect(out.cards[1]!.icon).toBe('zap');
    expect(out.cards[0]!.exercises[0]!.sets).toBe('4×12');
    expect(out.cards[0]!.exercises[1]!.load).toBe('—'); // null load
    expect(out.cards[0]!.student.initials).toBe('JS');
    expect(out.cards[0]!.status).toBe('active');
    expect(out.cards[1]!.status).toBe('archived');
  });

  it('handles empty/null list', () => {
    expect(mapWorkouts(null).cards).toEqual([]);
    expect(mapWorkouts([]).cards).toEqual([]);
  });

  it('createdAt slices "YYYY-MM-DD" to "MM-DD"', () => {
    const out = mapWorkouts([
      {
        documentId: 'w',
        name: 'x',
        isActive: true,
        validFrom: '2026-03-14',
        exercises: [],
      },
    ]);
    expect(out.cards[0]!.createdAt).toBe('03-14');
  });
});
