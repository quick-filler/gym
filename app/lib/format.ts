/**
 * Pure formatting helpers shared across the app. Extracted from
 * hooks/useDependents.ts so they can be unit-tested without an Expo
 * runtime or a React Native module loader.
 */

/** "R$ 120" with no decimals, pt-BR locale. */
export function monthlyBRL(price: number): string {
  return `R$ ${price.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Returns age in years from a `YYYY-MM-DD` birthdate, accounting for
 * whether the birthday has already occurred this year.
 * Returns 0 for empty / invalid input.
 */
export function ageFrom(birthdate: string | null | undefined): number {
  if (!birthdate) return 0;
  const parts = birthdate.split('-').map(Number);
  const [y, m, d] = parts;
  if (!y) return 0;
  const birth = new Date(y, (m ?? 1) - 1, d ?? 1);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

/** ISO `YYYY-MM-DD` → `DD/MM/YYYY`. Accepts datetimes too (slices to 10). */
export function fmtDateBR(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}
