/**
 * Cambodia timezone (ICT = UTC+7). Use for all user-facing dates/times.
 * Formatters are deterministic (same input => same output on server and client) to avoid React hydration mismatch.
 */
export const CAMBODIA_TZ = "Asia/Phnom_Penh";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ICT_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Cambodia local date/time from ISO string (UTC+7) */
function toCambodiaParts(dateStr: string): { y: number; m: number; d: number; h: number; min: number; w: number } {
  const d = new Date(dateStr);
  const utc = d.getTime();
  const local = new Date(utc + ICT_OFFSET_MS);
  const u = local.getUTCDate();
  const M = local.getUTCMonth();
  const y = local.getUTCFullYear();
  const w = local.getUTCDay();
  const h = local.getUTCHours();
  const min = local.getUTCMinutes();
  return { y: y, m: M, d: u, h: h, min: min, w: w };
}

/** Date + time in Cambodia (e.g. "Mar 8, 2026, 03:13 PM") - deterministic for hydration */
export function formatDateTimeCambodia(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const { y, m, d, h, min } = toCambodiaParts(dateStr);
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  const min2 = String(min).padStart(2, "0");
  return `${MONTHS_SHORT[m]} ${d}, ${y}, ${hour12}:${min2} ${ampm}`;
}

/** Short date + time (e.g. "Mar 8, 03:13 PM") - deterministic for hydration */
export function formatDateTimeShortCambodia(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const { y, m, d, h, min } = toCambodiaParts(dateStr);
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  const min2 = String(min).padStart(2, "0");
  return `${MONTHS_SHORT[m]} ${d}, ${hour12}:${min2} ${ampm}`;
}

/** Date only in Cambodia (e.g. "Sat, Mar 8") - deterministic for hydration */
export function formatDateCambodia(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const { m, d, w } = toCambodiaParts(dateStr);
  return `${WEEKDAYS_SHORT[w]}, ${MONTHS_SHORT[m]} ${d}`;
}
