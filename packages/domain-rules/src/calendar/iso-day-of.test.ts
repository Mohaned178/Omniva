import { describe, expect, it } from 'vitest';
import { isoDayOf } from './iso-day-of.js';

describe('isoDayOf', () => {
  it('writes a day with its month and day padded to two digits', () => {
    expect(isoDayOf({ year: 2027, month: 3, day: 6 })).toBe('2027-03-06');
    expect(isoDayOf({ year: 2028, month: 12, day: 31 })).toBe('2028-12-31');
  });
});
