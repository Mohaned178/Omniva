import type { CalendarDate, DateValue } from '@omniva/domain-types';
import { dayNumberOf } from '../calendar/day-number.js';

/**
 * Whole days from `today` to the date; negative once it has passed, none for a missing date.
 * A month-only date counts from the first of its month, so its reminder comes early enough to
 * be safe (spec, Reminders).
 */
export function daysUntil(today: CalendarDate, value: DateValue): number | undefined {
  switch (value.precision) {
    case 'missing':
      return undefined;
    case 'month':
      return dayNumberOf({ year: value.year, month: value.month, day: 1 }) - dayNumberOf(today);
    case 'exact':
      return dayNumberOf(value.date) - dayNumberOf(today);
    default: {
      const unknownPrecision: never = value;
      return unknownPrecision;
    }
  }
}
