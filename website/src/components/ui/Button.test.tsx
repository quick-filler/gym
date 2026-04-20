import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders a <button> by default', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button', { name: 'Click' });
    expect(btn.tagName).toBe('BUTTON');
  });

  it('renders a Next <Link> when href is supplied', () => {
    render(<Button href="/pricing">Ver preços</Button>);
    const link = screen.getByRole('link', { name: 'Ver preços' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="ink">X</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-ink-900');
    rerender(<Button variant="flame">X</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-flame');
    rerender(<Button variant="line">X</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-ink-900');
    rerender(<Button variant="ghost">X</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('block makes the button full-width', () => {
    render(<Button block>X</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('appends custom className without losing variant classes', () => {
    render(
      <Button variant="ink" className="my-custom">
        X
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-ink-900');
    expect(btn).toHaveClass('my-custom');
  });

  it('forwards disabled to the underlying button', () => {
    render(<Button disabled>X</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
