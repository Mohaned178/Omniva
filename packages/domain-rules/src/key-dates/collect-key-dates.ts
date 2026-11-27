import type { CalendarDate } from '@omniva/domain-types';
import { parseDateValue } from './parse-date-value.js';

/** A record's Key date as the collection holds it. */
export type CollectedKeyDate =
  | {
      readonly field: string;
      readonly precision: 'exact' | 'month';
      /** The exact day, or the first of the month for a month-only date. */
      readonly day: CalendarDate;
    }
  | { readonly field: string; readonly precision: 'missing' };

/**
 * The Key dates a record holds, read from its fields. A Key date field the record doesn't
 * hold is not a missing date: only a date the user marked missing is, so a record that
 * starts with just a title doesn't fill the attention list.
 */
export function collectKeyDates(
  keyDateFields: readonly string[],
  fields: Readonly<Record<string, string | number>>,
): readonly CollectedKeyDate[] {
  const collected: CollectedKeyDate[] = [];
  for (const field of keyDateFields) {
    const text = fields[field];
    const value = typeof text === 'string' ? parseDateValue(text) : undefined;
    if (value === undefined) continue;
    switch (value.precision) {
      case 'exact':
        collected.push({ field, precision: 'exact', day: value.date });
        break;
      case 'month':
        collected.push({
          field,
          precision: 'month',
          day: { year: value.year, month: value.month, day: 1 },
        });
        break;
      case 'missing':
        collected.push({ field, precision: 'missing' });
        break;
      default: {
        const unknownPrecision: never = value;
        throw new Error(`Unknown precision ${String(unknownPrecision)}`);
      }
    }
  }
  return collected;
}
