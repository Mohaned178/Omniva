import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { formatDateValue, parseDateValue } from './parse-date-value.js';

const FIRST_DAY = new Date('1900-01-01');
const LAST_DAY = new Date('2200-12-31');
const ISO_DAY_LENGTH = 10;
const ISO_MONTH_LENGTH = 7;

describe('parseDateValue', () => {
  it('reads an exact day', () => {
    expect(parseDateValue('2027-03-15')).toEqual({
      precision: 'exact',
      date: { year: 2027, month: 3, day: 15 },
    });
  });

  it('reads a month only', () => {
    expect(parseDateValue('2027-03')).toEqual({ precision: 'month', year: 2027, month: 3 });
  });

  it('reads the mark for a date that is missing', () => {
    expect(parseDateValue('missing')).toEqual({ precision: 'missing' });
  });

  it.each(['', '2027', '2027-13', '2027-00', '2027-02-30', '2027-3-5', 'March 2027', ' 2027-03'])(
    'refuses %j, which is no date a user could have given',
    (text) => {
      expect(parseDateValue(text)).toBeUndefined();
    },
  );

  it('knows 29 February only in a leap year', () => {
    expect(parseDateValue('2028-02-29')).toBeDefined();
    expect(parseDateValue('2027-02-29')).toBeUndefined();
  });

  it('formats back to exactly what it read', () => {
    const days = fc.date({ min: FIRST_DAY, max: LAST_DAY, noInvalidDate: true });
    const texts = fc.oneof(
      fc.constant('missing'),
      days.map((day) => day.toISOString().slice(0, ISO_DAY_LENGTH)),
      days.map((day) => day.toISOString().slice(0, ISO_MONTH_LENGTH)),
    );
    fc.assert(
      fc.property(texts, (text) => {
        const value = parseDateValue(text);
        expect(value && formatDateValue(value)).toBe(text);
      }),
    );
  });
});
