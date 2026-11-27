import { parseDateValue } from '@omniva/domain-rules';
import type { CalendarDate } from '@omniva/schemas';

/** The day an ISO `YYYY-MM-DD` names; the shared schemas have already checked it is one. */
export function dayOfIso(text: string): CalendarDate {
  const value = parseDateValue(text);
  if (value?.precision !== 'exact') throw new RangeError('Not an ISO day');
  return value.date;
}
