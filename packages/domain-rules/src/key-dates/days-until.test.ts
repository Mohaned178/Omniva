import { describe, expect, it } from 'vitest';
import { daysUntil } from './days-until.js';

const TODAY = { year: 2026, month: 11, day: 27 } as const;

describe('daysUntil', () => {
  it('counts the days to an exact day, across a year boundary', () => {
    expect(daysUntil(TODAY, { precision: 'exact', date: { year: 2026, month: 11, day: 30 } })).toBe(
      3,
    );
    expect(daysUntil(TODAY, { precision: 'exact', date: { year: 2027, month: 1, day: 1 } })).toBe(
      35,
    );
  });

  it('is negative once the day has passed and zero on the day itself', () => {
    expect(daysUntil(TODAY, { precision: 'exact', date: { year: 2026, month: 11, day: 26 } })).toBe(
      -1,
    );
    expect(daysUntil(TODAY, { precision: 'exact', date: TODAY })).toBe(0);
  });

  it('counts a month-only date from the first of its month', () => {
    expect(daysUntil(TODAY, { precision: 'month', year: 2026, month: 12 })).toBe(4);
  });

  it('has no days to a date that is missing', () => {
    expect(daysUntil(TODAY, { precision: 'missing' })).toBeUndefined();
  });
});
