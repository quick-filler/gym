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

/** "R$ 99,00" with two decimals, pt-BR locale. For payment amounts. */
export function brl(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return `R$ ${n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Just the "99,00" part (no symbol), for the big balance card. */
export function brlAmount(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
 * Compact relative time for the notification inbox: "agora", "há 5 min",
 * "há 3 h", "ontem", else "DD/MM". Falls back to "" on bad input.
 */
export function timeAgoBR(
  iso: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!iso) return '';
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return '';
  const sec = Math.floor((now.getTime() - t.getTime()) / 1000);
  if (sec < 60) return 'agora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  return fmtDateBR(t.toISOString());
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

/* ------------------------------------------------------------------
 * Calendar helpers for the weekly Agenda (TZ-safe via UTC midnight, so a
 * yyyy-mm-dd calendar date keeps its weekday regardless of device TZ).
 * ------------------------------------------------------------------ */

export const WEEKDAY_SHORT_PT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
export const WEEKDAY_LONG_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
export const MONTH_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** Weekday (0=Sun .. 6=Sat) for a `yyyy-mm-dd` date. */
export function weekdayIndexISO(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

/** Adds `n` days to a `yyyy-mm-dd` date, returns `yyyy-mm-dd`. */
export function addDaysISO(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Monday (ISO week start) of the week containing `dateStr`. */
export function mondayOfWeekISO(dateStr: string): string {
  const offset = (weekdayIndexISO(dateStr) + 6) % 7; // Mon→0, Sun→6
  return addDaysISO(dateStr, -offset);
}

/** Device-local today as `yyyy-mm-dd`. */
export function todayISO(now: Date = new Date()): string {
  return localISODate(now);
}

export interface WeekDayDescriptor {
  id: string; // yyyy-mm-dd
  weekdayShort: string; // "SEG"
  dayNumber: string; // "08"
  fullTitle: string; // "Segunda-feira"
  fullSubtitle: string; // "8 de junho, 2026"
  isToday: boolean;
}

/**
 * Builds the 7 day descriptors of a week starting at `mondayISO`,
 * flagging `todayISO` as today. Pure — the hook supplies both dates.
 */
export function buildWeekDays(
  mondayISO: string,
  today: string,
): WeekDayDescriptor[] {
  return Array.from({ length: 7 }, (_, i) => {
    const id = addDaysISO(mondayISO, i);
    const [y, m, d] = id.split('-').map(Number);
    const wd = weekdayIndexISO(id);
    return {
      id,
      weekdayShort: WEEKDAY_SHORT_PT[wd],
      dayNumber: String(d).padStart(2, '0'),
      fullTitle: WEEKDAY_LONG_PT[wd],
      fullSubtitle: `${d} de ${MONTH_PT[m - 1]}, ${y}`,
      isToday: id === today,
    };
  });
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
