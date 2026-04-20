import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pill } from './Pill';

describe('Pill', () => {
  it('renders its children', () => {
    render(<Pill>PAGO</Pill>);
    expect(screen.getByText('PAGO')).toBeInTheDocument();
  });

  it('defaults to ink tone', () => {
    render(<Pill>X</Pill>);
    expect(screen.getByText('X')).toHaveClass('bg-paper-2');
  });

  it.each([
    ['emerald', 'bg-emerald-50 text-emerald'],
    ['rose', 'bg-rose-50 text-rose'],
    ['amber', 'bg-amber-50 text-amber'],
    ['sky', 'bg-sky-50 text-sky'],
    ['flame', 'bg-flame-50 text-flame'],
  ] as const)('%s tone applies %s', (tone, expected) => {
    render(<Pill tone={tone}>X</Pill>);
    const span = screen.getByText('X');
    for (const cls of expected.split(' ')) {
      expect(span).toHaveClass(cls);
    }
  });
});
