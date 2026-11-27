import { describe, expect, it } from 'vitest';
import { calendarDateOf } from './calendar-date-of.js';

describe('calendarDateOf', () => {
  it('names the UTC day, even late in the evening', () => {
    expect(calendarDateOf(new Date('2027-03-01T23:59:59.999Z'))).toEqual({
      year: 2027,
      month: 3,
      day: 1,
    });
    expect(calendarDateOf(new Date('2027-03-02T00:00:00.000Z'))).toEqual({
      year: 2027,
      month: 3,
      day: 2,
    });
  });
});
