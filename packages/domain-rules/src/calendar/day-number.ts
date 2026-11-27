import type { CalendarDate } from '@omniva/domain-types';

const MILLISECONDS_PER_DAY = 86_400_000;

/** The day's position on a continuous count of days, so dates compare and subtract. */
export function dayNumberOf({ year, month, day }: CalendarDate): number {
  return Math.round(Date.UTC(year, month - 1, day) / MILLISECONDS_PER_DAY);
}
