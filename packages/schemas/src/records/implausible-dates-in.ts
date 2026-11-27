import { findImplausibleDates, parseDateValue, type ImplausibleDate } from '@omniva/domain-rules';
import type { CalendarDate, DateValue } from '@omniva/domain-types';
import type { RecordFields } from './record-fields.js';
import type { TypeDefinition } from './type-definition.js';

interface ImplausibleDatesCheck {
  readonly type: TypeDefinition;
  readonly fields: RecordFields;
  readonly today: CalendarDate;
  /** The fields before this change; a date the change leaves alone was already confirmed. */
  readonly previousFields?: RecordFields;
}

/**
 * The dates a change makes implausible (spec D45), judged against the record's Type. Shared by
 * the API, which refuses them, and the web app, which warns before it asks.
 */
export function implausibleDatesIn({
  type,
  fields,
  today,
  previousFields = {},
}: ImplausibleDatesCheck): readonly ImplausibleDate[] {
  const dates = Object.fromEntries(
    type.fields.flatMap(({ key }) => {
      const value = dateValueOf(fields[key]);
      return value ? [[key, value] as const] : [];
    }),
  );
  const hasChanged = (field: string): boolean => fields[field] !== previousFields[field];
  return findImplausibleDates({ today, dates, order: type.dateOrder }).filter(
    (found) =>
      hasChanged(found.field) ||
      (found.reason === 'before-earlier-date' && hasChanged(found.earlierField)),
  );
}

function dateValueOf(text: string | number | undefined): DateValue | undefined {
  return typeof text === 'string' ? parseDateValue(text) : undefined;
}
