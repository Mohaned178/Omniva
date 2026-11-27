import type { CalendarDate, DateValue } from '@omniva/domain-types';
import { addCalendarMonths } from '../calendar/add-calendar-months.js';
import { dayNumberOf } from '../calendar/day-number.js';
import { daysInMonth } from '../calendar/days-in-month.js';

/** Further ahead than this is more likely a typo ("2205") than a real date. */
const MAX_YEARS_AHEAD = 30;
/** Further back than this is more likely a typo than a real date. */
const MAX_YEARS_BEHIND = 100;
const MONTHS_PER_YEAR = 12;

/** A pair of a Type's date fields where `earlier` should not come after `later`. */
export interface DateOrder {
  readonly earlier: string;
  readonly later: string;
}

export type ImplausibleDate =
  | { readonly field: string; readonly reason: 'too-far-ahead' | 'too-far-behind' }
  | {
      readonly field: string;
      readonly reason: 'before-earlier-date';
      readonly earlierField: string;
    };

interface Plausibility {
  readonly today: CalendarDate;
  /** The dates given, by field key. */
  readonly dates: Readonly<Record<string, DateValue>>;
  readonly order: readonly DateOrder[];
}

/**
 * The dates that are probably typos (spec D45): far from today, or in the wrong order (an
 * expiry before its issue date). A month-only date is flagged only when every day of it is
 * wrong, so approximate knowledge is never second-guessed. Missing dates are never flagged.
 */
export function findImplausibleDates({
  today,
  dates,
  order,
}: Plausibility): readonly ImplausibleDate[] {
  const latestPlausible = dayNumberOf(addCalendarMonths(today, MAX_YEARS_AHEAD * MONTHS_PER_YEAR));
  const earliestPlausible = dayNumberOf(
    addCalendarMonths(today, -MAX_YEARS_BEHIND * MONTHS_PER_YEAR),
  );
  const found: ImplausibleDate[] = [];
  for (const [field, value] of Object.entries(dates)) {
    const span = spanOf(value);
    if (!span) continue;
    if (span.first > latestPlausible) found.push({ field, reason: 'too-far-ahead' });
    else if (span.last < earliestPlausible) found.push({ field, reason: 'too-far-behind' });
  }
  for (const { earlier, later } of order) {
    const earlierSpan = spanOf(dates[earlier]);
    const laterSpan = spanOf(dates[later]);
    if (earlierSpan && laterSpan && laterSpan.last < earlierSpan.first) {
      found.push({ field: later, reason: 'before-earlier-date', earlierField: earlier });
    }
  }
  return found;
}

/** The first and last day a date could mean, as day numbers; none for a missing date. */
function spanOf(value: DateValue | undefined): { first: number; last: number } | undefined {
  if (value === undefined || value.precision === 'missing') return undefined;
  if (value.precision === 'exact') {
    const day = dayNumberOf(value.date);
    return { first: day, last: day };
  }
  const { year, month } = value;
  return {
    first: dayNumberOf({ year, month, day: 1 }),
    last: dayNumberOf({ year, month, day: daysInMonth(year, month) }),
  };
}
