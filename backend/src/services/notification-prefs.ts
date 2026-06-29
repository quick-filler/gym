/**
 * Per-user push notification preferences (opt-out by category).
 *
 * Stored as a JSON blob on `Student.notificationPrefs`. The in-app inbox always
 * receives every notification (it's the fallback); these prefs gate only
 * *push delivery* per category. Default is everything on (opt-out model — the
 * stores prefer opt-out over opt-in). Pure + unit-tested.
 */

export type NotificationCategory = 'payments' | 'classes' | 'workouts';

export interface NotificationPrefs {
  payments: boolean;
  classes: boolean;
  workouts: boolean;
}

export const DEFAULT_PREFS: NotificationPrefs = {
  payments: true,
  classes: true,
  workouts: true,
};

/** User-facing category metadata (drives the app's toggle list). */
export const CATEGORY_META: Array<{
  key: NotificationCategory;
  title: string;
  description: string;
}> = [
  {
    key: 'payments',
    title: 'Pagamentos',
    description: 'Cobranças a vencer e pagamentos confirmados',
  },
  {
    key: 'classes',
    title: 'Aulas',
    description: 'Reservas, lembretes de aula e vaga confirmada',
  },
  {
    key: 'workouts',
    title: 'Treinos',
    description: 'Novas fichas de treino e atividades de piscina',
  },
];

/**
 * Normalize a stored blob to a complete prefs object. Anything not explicitly
 * `false` stays on, so a partial/empty blob (or a new category added later)
 * defaults to enabled.
 */
export function resolvePrefs(raw: unknown): NotificationPrefs {
  const r = (raw ?? {}) as Record<string, unknown>;
  if (typeof r !== 'object') return { ...DEFAULT_PREFS };
  return {
    payments: r.payments !== false,
    classes: r.classes !== false,
    workouts: r.workouts !== false,
  };
}

/** Whitelist an incoming update to the known boolean categories. */
export function sanitizePrefsInput(input: unknown): Partial<NotificationPrefs> {
  const r = (input ?? {}) as Record<string, unknown>;
  const out: Partial<NotificationPrefs> = {};
  for (const { key } of CATEGORY_META) {
    if (typeof r[key] === 'boolean') out[key] = r[key] as boolean;
  }
  return out;
}

const KIND_CATEGORY: Record<string, NotificationCategory> = {
  payment_due: 'payments',
  payment_paid: 'payments',
  booking_confirmed: 'classes',
  class_reminder: 'classes',
  workout_new: 'workouts',
};

/** Maps a notification `kind` to a togglable category, or null (always send). */
export function kindToCategory(kind: string): NotificationCategory | null {
  return KIND_CATEGORY[kind] ?? null;
}

/**
 * Whether a push for `kind` should go out given the user's prefs. Uncategorized
 * kinds (e.g. admin_*) are never gated — they always send.
 */
export function pushAllowed(prefs: NotificationPrefs, kind: string | undefined): boolean {
  if (!kind) return true;
  const cat = kindToCategory(kind);
  if (!cat) return true;
  return prefs[cat];
}
