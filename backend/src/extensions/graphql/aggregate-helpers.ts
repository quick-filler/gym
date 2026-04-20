/**
 * Pure helpers extracted from aggregates.ts so they can be unit-tested
 * without a running Strapi instance. Anything in this file must stay
 * free of strapi/nexus/db imports.
 */

export const MONTH_LABELS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

export const MONTH_SHORT_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
] as const;

export const CATEGORY_LABEL: Record<string, string> = {
  rent: 'Aluguel',
  utilities: 'Utilidades',
  payroll: 'Salários',
  equipment: 'Equipamentos',
  marketing: 'Marketing',
  supplies: 'Material',
  taxes: 'Impostos',
  software: 'Software',
  other: 'Outros',
};

/** Formats a number as "R$ 1.234,56" (two decimals, pt-BR). */
export function BRL(n: number): string {
  return `R$ ${Number(n).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Formats a number as "R$ 1.234" (no decimals, pt-BR). Used in the DRE
 *  hero where decimals would visually clutter the big numbers. */
export function BRL_SHORT(n: number): string {
  return `R$ ${Number(n).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Returns the ISO date string window for a calendar month:
 *   monthWindow(2026, 4) → { start: '2026-04-01', end: '2026-05-01' }
 *
 * Wraps December: monthWindow(2026, 12) → '2027-01-01' end.
 */
export function monthWindow(
  year: number,
  month: number,
): { start: string; end: string } {
  const mm = String(month).padStart(2, '0');
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nmm = String(nextMonth).padStart(2, '0');
  return { start: `${year}-${mm}-01`, end: `${nextYear}-${nmm}-01` };
}

/** "Ana Beatriz Souza" → "AS". Single-word names use first 2 chars. */
export function initialsFor(name: string): string {
  const parts = (name ?? '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** ISO `YYYY-MM-DD` → `DD/MM/YYYY`. Accepts datetimes too (slices to 10). */
export function fmtDateBR(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

/** Sunday=0 weekday for a `YYYY-MM-DD` string. Anchors at noon to
 *  avoid off-by-one across DST transitions. */
export function weekdayISO(iso: string): number {
  return new Date(iso + 'T12:00:00').getDay();
}
