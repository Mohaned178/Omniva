import { calendarDateOf, type ReminderHandling } from '@omniva/domain-rules';

/** How the reminder_handling table holds what the user did about a reminder. */
export interface StoredHandling {
  readonly status: 'handled' | 'snoozed';
  readonly snoozedUntil: Date | null;
}

/** What the user did about a reminder; no row means they have done nothing yet. */
export function handlingOf(stored: StoredHandling | null | undefined): ReminderHandling {
  if (!stored) return { status: 'open' };
  if (stored.status === 'handled') return { status: 'handled' };
  // The table's check constraint guarantees a snoozed row has its end day.
  if (stored.snoozedUntil === null) return { status: 'open' };
  return { status: 'snoozed', until: calendarDateOf(stored.snoozedUntil) };
}
