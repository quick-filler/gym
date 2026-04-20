import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders the initials', () => {
    render(<Avatar initials="JS" />);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('applies the provided color via inline style', () => {
    render(<Avatar initials="AB" color="#e8551c" />);
    const el = screen.getByText('AB');
    expect(el).toHaveStyle({ background: '#e8551c' });
  });

  it('defaults to ink-900 when color is omitted', () => {
    render(<Avatar initials="AB" />);
    const el = screen.getByText('AB');
    expect(el).toHaveStyle({ background: 'var(--color-ink-900)' });
  });

  it.each([
    ['sm', 'w-8'],
    ['md', 'w-10'],
    ['lg', 'w-12'],
  ] as const)('size=%s applies %s', (size, cls) => {
    render(<Avatar initials="AB" size={size} />);
    expect(screen.getByText('AB')).toHaveClass(cls);
  });
});
