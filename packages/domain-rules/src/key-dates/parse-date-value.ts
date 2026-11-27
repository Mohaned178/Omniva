import type { DateValue } from '@omniva/domain-types';
import { daysInMonth } from '../calendar/days-in-month.js';

/** How a record's fields hold a date the user has marked missing. */
export const MISSING_DATE_TEXT = 'missing';

const EXACT_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_ONLY = /^(\d{4})-(\d{2})$/;
const MONTHS_PER_YEAR = 12;

/**
 * Reads how a record's field holds a date: `2027-03-15` for an exact day, `2027-03` for a
 * month only, `missing` for a date the user doesn't know yet. Anything else is no date.
 */
export function parseDateValue(text: string): DateValue | undefined {
  if (text === MISSING_DATE_TEXT) return { precision: 'missing' };
  const exact = EXACT_DAY.exec(text);
  if (exact) {
    const [year, month, day] = exact.slice(1).map(Number);
    if (year === undefined || month === undefined || day === undefined) return undefined;
    if (!isMonth(month) || day < 1 || day > daysInMonth(year, month)) return undefined;
    return { precision: 'exact', date: { year, month, day } };
  }
  const monthOnly = MONTH_ONLY.exec(text);
  if (monthOnly) {
    const [year, month] = monthOnly.slice(1).map(Number);
    if (year === undefined || month === undefined || !isMonth(month)) return undefined;
    return { precision: 'month', year, month };
  }
  return undefined;
}

function isMonth(month: number): boolean {
  return month >= 1 && month <= MONTHS_PER_YEAR;
}
