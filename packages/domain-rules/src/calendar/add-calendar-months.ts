import type { CalendarDate } from '@omniva/domain-types';
import { daysInMonth } from './days-in-month.js';

const MONTHS_PER_YEAR = 12;

/**
 * Moves a calendar date by whole months. When the target month is shorter than the start
 * day, the date lands on that month's last day (31 March + 1 month = 30 April), which is
 * how monthly renewals and recurrences behave in everyday life.
 */
export function addCalendarMonths(start: CalendarDate, months: number): CalendarDate {
  const monthIndex = start.year * MONTHS_PER_YEAR + (start.month - 1) + months;
  const year = Math.floor(monthIndex / MONTHS_PER_YEAR);
  const month = monthIndex - year * MONTHS_PER_YEAR + 1;
  const day = Math.min(start.day, daysInMonth(year, month));
  return { year, month, day };
}
