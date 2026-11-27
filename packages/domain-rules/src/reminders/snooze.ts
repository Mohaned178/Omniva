import type { CalendarDate } from '@omniva/domain-types';
import { dayNumberOf } from '../calendar/day-number.js';
import type { ReminderHandling } from './outstanding-due-notices.js';

/**
 * Whether a Key date belongs on the attention list, given what the user did about its reminder
 * (GLOSSARY.md, Handled, Snoozed): a handled date is off it for good, a snoozed one until the
 * day its snooze ends.
 */
export function isOnAttentionList(handling: ReminderHandling, today: CalendarDate): boolean {
  switch (handling.status) {
    case 'open':
      return true;
    case 'handled':
      return false;
    case 'snoozed':
      return dayNumberOf(handling.until) <= dayNumberOf(today);
    default: {
      const unknownStatus: never = handling;
      return unknownStatus;
    }
  }
}

/** A snooze must end after today: a snooze that ends today or earlier snoozes nothing. */
export function isSnoozeAhead(until: CalendarDate, today: CalendarDate): boolean {
  return dayNumberOf(until) > dayNumberOf(today);
}
