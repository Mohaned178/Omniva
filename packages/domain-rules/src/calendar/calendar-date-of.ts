import type { CalendarDate } from '@omniva/domain-types';

/**
 * The calendar day an instant falls on in UTC. Until a workspace's time zone applies
 * (spec D41), "today" is the UTC day.
 */
export function calendarDateOf(instant: Date): CalendarDate {
  return {
    year: instant.getUTCFullYear(),
    month: instant.getUTCMonth() + 1,
    day: instant.getUTCDate(),
  };
}
