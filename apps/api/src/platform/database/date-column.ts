import type { CalendarDate } from '@omniva/schemas';

/**
 * A calendar day as a DATE column holds it: midnight UTC, with no time or zone of its own
 * (CODING_STANDARDS §6). `calendarDateOf` reads one back.
 */
export function dateColumnOf({ year, month, day }: CalendarDate): Date {
  return new Date(Date.UTC(year, month - 1, day));
}
