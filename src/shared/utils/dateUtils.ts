/**
 * Localized date utilities to prevent UTC midnight boundary shifts.
 * Ensures users in negative UTC offsets (e.g. Americas) don't have
 * logs flip to tomorrow's date in late evening.
 */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add or subtract calendar days from a YYYY-MM-DD date string
 * without UTC timezone distortion.
 */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

/**
 * Returns true if the provided YYYY-MM-DD date string matches today in local time.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getLocalDateString();
}
