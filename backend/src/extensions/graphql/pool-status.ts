/**
 * Pure pool water-quality status logic — shared by the admin
 * `PoolInspection.status` field and the student-facing `myAcademyPoolStatus`
 * query. No Strapi/DB access here so it's trivially unit-testable.
 *
 * A reading is classified against the academy's PoolSettings ideal range
 * `[min, max]`:
 *   - inside the range                → ok
 *   - outside, but within ±tolerance  → warning
 *   - further out than tolerance      → critical
 * Each metric (pH / chlorine / temperature) is graded independently; the
 * worst of the three is the inspection's overall status. A missing metric
 * (null) never degrades the overall status — for display it's surfaced as
 * `unknown` so the app can grey it out instead of pretending it's "ok".
 */

export type PoolStatus = 'ok' | 'warning' | 'critical';
export type PoolMetricDisplayStatus = PoolStatus | 'unknown';

/**
 * Classify a value against its ideal range + tolerance. Null/undefined
 * value or bounds → 'ok' (an unrecorded metric must not degrade the overall
 * status — mirrors the legacy admin behaviour).
 */
export function classify(
  value: number | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined,
  tolerance: number,
): PoolStatus {
  if (value == null || min == null || max == null) return 'ok';
  if (value >= min && value <= max) return 'ok';
  if (value >= min - tolerance && value <= max + tolerance) return 'warning';
  return 'critical';
}

/** Worst (most severe) status among the arguments. */
export function worst(...statuses: PoolStatus[]): PoolStatus {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'ok';
}

/**
 * Per-metric status for *display*: same as `classify`, except a null value
 * surfaces as 'unknown' (not measured) rather than 'ok'.
 */
export function displayStatus(
  value: number | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined,
  tolerance: number,
): PoolMetricDisplayStatus {
  if (value == null) return 'unknown';
  return classify(value, min, max, tolerance);
}

export interface PoolSettingsLike {
  phMin?: number | null;
  phMax?: number | null;
  chlorineMin?: number | null;
  chlorineMax?: number | null;
  temperatureMin?: number | null;
  temperatureMax?: number | null;
  alertTolerance?: number | null;
}

export interface InspectionLike {
  date: string;
  shift: string; // 'morning' | 'evening'
  scheduledTime?: string | null;
  ph?: number | null;
  chlorine?: number | null;
  temperature?: number | null;
  peopleCount?: number | null;
  createdAt?: string | null;
}

/**
 * Sortable key for "which reading is the most recent". Evening (later in the
 * day) ranks above morning on the same date. ISO dates sort lexically, so a
 * plain string compare gives the right order.
 */
export function inspectionSortKey(r: { date: string; shift: string }): string {
  return `${r.date}#${r.shift === 'evening' ? '2' : '1'}`;
}

/** The latest reading by (date, shift). Null for an empty list. */
export function pickLatestInspection<T extends { date: string; shift: string }>(
  rows: T[] | null | undefined,
): T | null {
  if (!rows || rows.length === 0) return null;
  return rows.reduce((best, r) =>
    inspectionSortKey(r) > inspectionSortKey(best) ? r : best,
  );
}

export interface PoolMetricView {
  value: number | null;
  min: number | null;
  max: number | null;
  status: PoolMetricDisplayStatus;
}

export interface PoolStatusView {
  date: string;
  shift: string;
  scheduledTime: string | null;
  measuredAt: string | null;
  peopleCount: number | null;
  ph: PoolMetricView;
  chlorine: PoolMetricView;
  temperature: PoolMetricView;
  overall: PoolStatus;
}

function metricView(
  value: number | null | undefined,
  min: number | null | undefined,
  max: number | null | undefined,
  tolerance: number,
): PoolMetricView {
  return {
    value: value ?? null,
    min: min ?? null,
    max: max ?? null,
    status: displayStatus(value, min, max, tolerance),
  };
}

/**
 * Build the full status view (per-metric + overall) for a reading against the
 * academy's settings. `settings` may be null (academy never configured) — in
 * that case every range is null so every metric reads 'unknown'/'ok'.
 */
export function computePoolStatus(
  settings: PoolSettingsLike | null | undefined,
  inspection: InspectionLike,
): PoolStatusView {
  const tol = Number(settings?.alertTolerance ?? 0);
  const ph = metricView(inspection.ph, settings?.phMin, settings?.phMax, tol);
  const chlorine = metricView(
    inspection.chlorine,
    settings?.chlorineMin,
    settings?.chlorineMax,
    tol,
  );
  const temperature = metricView(
    inspection.temperature,
    settings?.temperatureMin,
    settings?.temperatureMax,
    tol,
  );
  const overall = worst(
    classify(inspection.ph, settings?.phMin, settings?.phMax, tol),
    classify(inspection.chlorine, settings?.chlorineMin, settings?.chlorineMax, tol),
    classify(inspection.temperature, settings?.temperatureMin, settings?.temperatureMax, tol),
  );
  return {
    date: inspection.date,
    shift: inspection.shift,
    scheduledTime: inspection.scheduledTime ?? null,
    measuredAt: inspection.createdAt ?? null,
    peopleCount: inspection.peopleCount ?? null,
    ph,
    chlorine,
    temperature,
    overall,
  };
}
