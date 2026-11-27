import { implausibleDatesIn } from '@omniva/schemas';
import type { CalendarDate, RecordFields, TypeDefinition } from '@omniva/schemas';
import { ImplausibleDates } from '../errors/implausible-dates.js';

interface PlausibleDatesCheck {
  readonly type: TypeDefinition;
  readonly fields: RecordFields;
  readonly today: CalendarDate;
  /** The fields as they were before this change. */
  readonly previousFields?: RecordFields;
}

/**
 * Refuses dates that look like typos (spec D45) so the user sees them before they are saved.
 * A date the change did not touch is let through: the user already confirmed it.
 */
export function assertPlausibleDates(check: PlausibleDatesCheck): void {
  if (implausibleDatesIn(check).length > 0) throw new ImplausibleDates('A date looks like a typo.');
}
