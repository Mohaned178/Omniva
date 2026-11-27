import type { CalendarDate } from '@omniva/domain-types';
import { parseDateValue } from '../key-dates/parse-date-value.js';

/**
 * The day a `YYYY-MM-DD` names, the inverse of `isoDayOf`, for input a schema has already
 * checked; anything else is a mistake in the caller.
 */
export function dayOfIso(text: string): CalendarDate {
  const value = parseDateValue(text);
  if (value?.precision !== 'exact') throw new RangeError('Not an ISO day');
  return value.date;
}
