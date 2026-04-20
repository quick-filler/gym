import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(
      <MetricCard
        metric={{ id: 'x', label: 'Alunos ativos', value: '248' }}
      />,
    );
    expect(screen.getByText('Alunos ativos')).toBeInTheDocument();
    expect(screen.getByText('248')).toBeInTheDocument();
  });

  it('renders an up arrow + delta value when trend is up', () => {
    render(
      <MetricCard
        metric={{
          id: 'x',
          label: 'Receita',
          value: 'R$ 62.480',
          delta: { value: '+8%', trend: 'up' },
        }}
      />,
    );
    expect(screen.getByText((t) => t.includes('+8%'))).toBeInTheDocument();
    // Up arrow U+2191
    expect(
      screen.getByText((t) => t.includes('↑')),
    ).toBeInTheDocument();
  });

  it('renders a down arrow when trend is down', () => {
    render(
      <MetricCard
        metric={{
          id: 'x',
          label: 'Em atraso',
          value: 'R$ 100',
          delta: { value: '-2%', trend: 'down' },
        }}
      />,
    );
    expect(
      screen.getByText((t) => t.includes('↓')),
    ).toBeInTheDocument();
  });

  it('renders a flat arrow when trend is flat', () => {
    render(
      <MetricCard
        metric={{
          id: 'x',
          label: 'Projeção',
          value: '—',
          delta: { value: '0%', trend: 'flat' },
        }}
      />,
    );
    expect(
      screen.getByText((t) => t.includes('→')),
    ).toBeInTheDocument();
  });

  it('highlighted renders a dark card background', () => {
    const { container } = render(
      <MetricCard
        metric={{
          id: 'x',
          label: 'MRR',
          value: 'R$ 62k',
          highlighted: true,
        }}
      />,
    );
    const root = container.firstElementChild!;
    expect(root.className).toMatch(/bg-ink-900/);
  });
});
