import { describe, expect, it } from 'vitest';
import { dayOfIso } from './day-of-iso.js';
import { isoDayOf } from './iso-day-of.js';

describe('dayOfIso', () => {
  it('reads back the day isoDayOf writes', () => {
    expect(dayOfIso('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 });
    expect(isoDayOf(dayOfIso('2027-03-06'))).toBe('2027-03-06');
  });

  it('refuses text that names no day', () => {
    expect(() => dayOfIso('2027-02-30')).toThrow(RangeError);
  });
});
