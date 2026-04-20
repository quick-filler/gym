/**
 * Smoke test — renders the DRE admin page in mock mode with Apollo
 * context present. Catches import errors, fatal render crashes, and
 * verifies key copy appears. Not a visual regression test; just a
 * "does it mount without exploding" guard.
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '@/lib/apollo';
import DREPage from './page';

describe('<DREPage /> smoke', () => {
  it('renders topbar, hero metrics, and expenses table', () => {
    render(
      <ApolloProvider client={apolloClient}>
        <DREPage />
      </ApolloProvider>,
    );

    // Topbar + page header titles
    expect(screen.getAllByText(/DRE/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Demonstrativo de Resultado/)).toBeInTheDocument();

    // Hero metric labels from MOCK_DRE
    expect(screen.getAllByText(/Receita bruta/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Total de despesas/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lucro l[íi]quido/i).length).toBeGreaterThan(0);

    // Cashflow chart section
    expect(screen.getByText(/Fluxo de caixa/i)).toBeInTheDocument();

    // Category breakdown header
    expect(
      screen.getByText(/Despesas por categoria/i),
    ).toBeInTheDocument();

    // Expenses table renders at least one row from MOCK_DRE
    expect(screen.getByText(/Aluguel — Abril/i)).toBeInTheDocument();
    expect(screen.getByText(/Folha de Pagamento/i)).toBeInTheDocument();
  });

  it('renders the "Nova despesa" CTAs (header + table)', () => {
    render(
      <ApolloProvider client={apolloClient}>
        <DREPage />
      </ApolloProvider>,
    );
    // Two CTAs in the layout: PageHeader actions + table header.
    const ctas = screen.getAllByText(/Nova despesa/i);
    expect(ctas.length).toBeGreaterThanOrEqual(1);
  });
});
