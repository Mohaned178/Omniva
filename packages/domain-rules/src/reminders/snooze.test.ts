import type { CalendarDate } from '@omniva/domain-types';
import { describe, expect, it } from 'vitest';
import { isOnAttentionList, isSnoozeAhead } from './snooze.js';

const day = (iso: string): CalendarDate => {
  const [year, month, dayOfMonth] = iso.split('-').map(Number);
  return { year, month, day: dayOfMonth } as CalendarDate;
};

describe('isOnAttentionList', () => {
  const today = day('2030-05-10');

  it('keeps a reminder the user has done nothing about', () => {
    expect(isOnAttentionList({ status: 'open' }, today)).toBe(true);
  });

  it('takes a handled reminder off for good', () => {
    expect(isOnAttentionList({ status: 'handled' }, today)).toBe(false);
  });

  it('keeps a snoozed reminder off until its snooze ends, and brings it back that day', () => {
    expect(isOnAttentionList({ status: 'snoozed', until: day('2030-05-11') }, today)).toBe(false);
    expect(isOnAttentionList({ status: 'snoozed', until: day('2030-05-10') }, today)).toBe(true);
    expect(isOnAttentionList({ status: 'snoozed', until: day('2030-05-09') }, today)).toBe(true);
  });
});

describe('isSnoozeAhead', () => {
  const today = day('2030-05-10');

  it('accepts a snooze ending after today only', () => {
    expect(isSnoozeAhead(day('2030-05-11'), today)).toBe(true);
    expect(isSnoozeAhead(day('2030-05-10'), today)).toBe(false);
    expect(isSnoozeAhead(day('2030-05-09'), today)).toBe(false);
  });

  it('counts across a month boundary', () => {
    expect(isSnoozeAhead(day('2030-06-01'), day('2030-05-31'))).toBe(true);
  });
});
