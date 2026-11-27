import { describe, expect, it } from 'vitest';
import { distanceInWords } from './distance-in-words.js';

describe('distanceInWords', () => {
  it.each([
    [0, { unit: 'today', count: 0 }],
    [1, { unit: 'days', count: 1, direction: 'ahead' }],
    [3, { unit: 'days', count: 3, direction: 'ahead' }],
    [13, { unit: 'days', count: 13, direction: 'ahead' }],
    [14, { unit: 'weeks', count: 2, direction: 'ahead' }],
    [20, { unit: 'weeks', count: 2, direction: 'ahead' }],
    [60, { unit: 'months', count: 2, direction: 'ahead' }],
    [213, { unit: 'months', count: 7, direction: 'ahead' }],
    [365, { unit: 'years', count: 1, direction: 'ahead' }],
    [800, { unit: 'years', count: 2, direction: 'ahead' }],
    [-1, { unit: 'days', count: 1, direction: 'behind' }],
    [-45, { unit: 'weeks', count: 6, direction: 'behind' }],
    [-400, { unit: 'years', count: 1, direction: 'behind' }],
  ] as const)('puts %i days as %j', (days, expected) => {
    expect(distanceInWords(days)).toEqual(expected);
  });
});
