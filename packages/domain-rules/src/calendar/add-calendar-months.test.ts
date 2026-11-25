import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { CalendarDate } from '@omniva/domain-types';
import { addCalendarMonths } from './add-calendar-months.js';

const date = (year: number, month: number, day: number): CalendarDate => ({ year, month, day });

const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const calendarDates = fc
  .record({
    year: fc.integer({ min: 1900, max: 2200 }),
    month: fc.integer({ min: 1, max: 12 }),
    dayOffset: fc.integer({ min: 0, max: 30 }),
  })
  .map(({ year, month, dayOffset }) =>
    date(year, month, 1 + (dayOffset % daysInMonth(year, month))),
  );

const monthCounts = fc.integer({ min: -1200, max: 1200 });

describe('addCalendarMonths', () => {
  it('keeps the same day when the later month has it', () => {
    expect(addCalendarMonths(date(2027, 3, 15), 1)).toEqual(date(2027, 4, 15));
  });

  it('moves a 31st onto the 30th in a 30-day month', () => {
    expect(addCalendarMonths(date(2027, 3, 31), 1)).toEqual(date(2027, 4, 30));
  });

  it('moves 31 January onto the last day of February, in common and leap years', () => {
    expect(addCalendarMonths(date(2027, 1, 31), 1)).toEqual(date(2027, 2, 28));
    expect(addCalendarMonths(date(2028, 1, 31), 1)).toEqual(date(2028, 2, 29));
  });

  it('crosses year boundaries forwards and backwards', () => {
    expect(addCalendarMonths(date(2027, 11, 30), 3)).toEqual(date(2028, 2, 29));
    expect(addCalendarMonths(date(2027, 1, 10), -2)).toEqual(date(2026, 11, 10));
  });

  it('always lands on a real date exactly the requested number of months away', () => {
    fc.assert(
      fc.property(calendarDates, monthCounts, (start, months) => {
        const result = addCalendarMonths(start, months);
        const monthsMoved = (result.year - start.year) * 12 + (result.month - start.month);

        expect(monthsMoved).toBe(months);
        expect(result.day).toBeGreaterThanOrEqual(1);
        expect(result.day).toBeLessThanOrEqual(daysInMonth(result.year, result.month));
      }),
    );
  });

  it('keeps the original day unless the target month is too short for it', () => {
    fc.assert(
      fc.property(calendarDates, monthCounts, (start, months) => {
        const result = addCalendarMonths(start, months);
        const lastDay = daysInMonth(result.year, result.month);

        expect(result.day).toBe(Math.min(start.day, lastDay));
      }),
    );
  });
});
