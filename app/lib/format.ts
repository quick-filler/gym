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

/**
 * Brazilian date input → ISO. "12/03/2018" → "2018-03-12". Passes through
 * a value already in ISO (`YYYY-MM-DD`). Returns "" for empty/invalid so
 * callers can treat it as "not provided".
 */
export function brDateToISO(input: string | null | undefined): string {
  if (!input) return '';
  const s = input.trim();
  // Already ISO?
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return '';
  const [, d, mo, y] = m;
  return `${y}-${mo}-${d}`;
}

/** Strapi Time scalar ("HH:mm:ss.SSS") → "HH:mm". Empty on bad input. */
export function hhmm(time: string | null | undefined): string {
  if (!time || typeof time !== 'string') return '';
  return time.slice(0, 5);
}

/** Local `YYYY-MM-DD` for a Date (device timezone). */
function localISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Human label for a booking's date + time window, e.g.
 *   "Hoje · 18:00 → 19:00" / "Amanhã · 07:00 → 08:00" / "12/06 · 19:00".
 * `now` is injectable for deterministic tests.
 */
export function nextClassTimeLabel(
  date: string | null | undefined,
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!date) return '';
  const day = date.slice(0, 10);
  const today = localISODate(now);
  const tomorrow = localISODate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
  );

  let dayLabel: string;
  if (day === today) dayLabel = 'Hoje';
  else if (day === tomorrow) dayLabel = 'Amanhã';
  else {
    const [, m, d] = day.split('-');
    dayLabel = m && d ? `${d}/${m}` : day;
  }

  const s = hhmm(startTime);
  const e = hhmm(endTime);
  const time = s && e ? `${s} → ${e}` : s;
  return time ? `${dayLabel} · ${time}` : dayLabel;
}
