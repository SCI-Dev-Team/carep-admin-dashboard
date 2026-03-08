/**
 * Cambodia timezone (ICT = UTC+7). Use for all user-facing dates/times.
 */
export const CAMBODIA_TZ = "Asia/Phnom_Penh";

const locale = "en-US";
const optsBase = { timeZone: CAMBODIA_TZ } as const;

/** Date + time in Cambodia (e.g. "Mar 8, 2026, 03:13 PM") */
export function formatDateTimeCambodia(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString(locale, {
    ...optsBase,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Short date + time (e.g. "Mar 8, 03:13 PM") */
export function formatDateTimeShortCambodia(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString(locale, {
    ...optsBase,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Date only in Cambodia (e.g. "Sat, Mar 8") */
export function formatDateCambodia(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, {
    ...optsBase,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
