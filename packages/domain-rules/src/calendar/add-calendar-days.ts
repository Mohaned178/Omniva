import type { CalendarDate } from '@omniva/domain-types';
import { calendarDateOf } from './calendar-date-of.js';
import { dayNumberOf } from './day-number.js';

const MILLISECONDS_PER_DAY = 86_400_000;

/** Moves a calendar date by whole days, forwards or (with a negative count) backwards. */
export function addCalendarDays(start: CalendarDate, days: number): CalendarDate {
  return calendarDateOf(new Date((dayNumberOf(start) + days) * MILLISECONDS_PER_DAY));
}
