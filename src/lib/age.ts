export interface Span {
  days?: number;
  weeks?: number;
  months?: number;
  years?: number;
}

const DAY_MS = 86_400_000;

// All dates are local midnight, so day counts never drift by an hour around DST or time zones.
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function parseISODate(value: string): Date {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Month arithmetic clamps to the end of the month: 31 Jan + 1 month is 28/29 Feb, not 3 Mar.
export function addSpan(date: Date, span: Span): Date {
  const months = (span.years ?? 0) * 12 + (span.months ?? 0);
  const targetMonth = date.getMonth() + months;
  const lastDay = new Date(date.getFullYear(), targetMonth + 1, 0).getDate();
  const result = new Date(date.getFullYear(), targetMonth, Math.min(date.getDate(), lastDay));
  result.setDate(result.getDate() + (span.weeks ?? 0) * 7 + (span.days ?? 0));
  return result;
}

export function diffDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export function ageParts(dob: Date, on: Date = today()) {
  let months = (on.getFullYear() - dob.getFullYear()) * 12 + (on.getMonth() - dob.getMonth());
  if (addSpan(dob, { months }) > on) months -= 1;
  months = Math.max(0, months);
  return { months, days: diffDays(addSpan(dob, { months }), on), totalDays: diffDays(dob, on) };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const joinParts = (a: string, b: string, showB: boolean) => (showB ? `${a} and ${b}` : a);

export function formatAge(dob: Date, on: Date = today()): string {
  const { months, days, totalDays } = ageParts(dob, on);
  if (totalDays < 14) return plural(Math.max(0, totalDays), 'day');
  if (months < 2) {
    const weeks = Math.floor(totalDays / 7);
    return joinParts(plural(weeks, 'week'), plural(totalDays % 7, 'day'), totalDays % 7 > 0);
  }
  if (months < 24) return joinParts(plural(months, 'month'), plural(days, 'day'), days > 0);
  return joinParts(plural(Math.floor(months / 12), 'year'), plural(months % 12, 'month'), months % 12 > 0);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function relativeDay(date: Date, on: Date = today()): string {
  const n = diffDays(on, date);
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  const amount =
    Math.abs(n) < 60 ? plural(Math.abs(n), 'day') : plural(Math.round(Math.abs(n) / 30.44), 'month');
  return n > 0 ? `in ${amount}` : `${amount} ago`;
}
