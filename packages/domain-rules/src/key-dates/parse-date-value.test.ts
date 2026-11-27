import { describe, expect, it } from 'vitest';
import { parseDateValue } from './parse-date-value.js';

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
});
