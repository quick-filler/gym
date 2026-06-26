/**
 * Small formatting + class-name helpers shared across pages.
 */

export function cn(
  ...inputs: Array<string | number | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Compact relative time for the notification bell: "agora", "há 5 min",
 * "há 3 h", "ontem", "há N dias", else a DD/MM/YYYY date. "" on bad input.
 */
export function timeAgo(
  value: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!value) return "";
  const t = new Date(value);
  if (Number.isNaN(t.getTime())) return "";
  const sec = Math.floor((now.getTime() - t.getTime()) / 1000);
  if (sec < 60) return "agora";
  const min = Math.floor(sec / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return formatDate(t);
}
