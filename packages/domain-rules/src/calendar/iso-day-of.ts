import type { CalendarDate } from '@omniva/domain-types';

const ISO_DAY_LENGTH = 10;

/**
 * A calendar day as `YYYY-MM-DD`: how the API carries one, and the form a raw SQL `::date`
 * reads without any time zone. `parseDateValue` reads it back.
 */
export function isoDayOf({ year, month, day }: CalendarDate): string {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, ISO_DAY_LENGTH);
}
