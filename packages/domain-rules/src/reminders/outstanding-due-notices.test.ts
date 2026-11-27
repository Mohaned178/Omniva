import { describe, expect, it } from 'vitest';
import type { CalendarDate } from '@omniva/domain-types';
import { outstandingDueNotices } from './outstanding-due-notices.js';

const date = (year: number, month: number, day: number): CalendarDate => ({ year, month, day });

describe('outstandingDueNotices', () => {
  it('gives one due notice per reminder rule, the rule’s number of days before an exact date', () => {
    const notices = outstandingDueNotices({
      keyDate: { precision: 'exact', day: date(2027, 6, 30) },
      daysBefore: [30, 7],
    });

    expect(notices).toEqual([
      { daysBefore: 30, remindOn: date(2027, 5, 31), lapsesOn: date(2027, 6, 30) },
      { daysBefore: 7, remindOn: date(2027, 6, 23), lapsesOn: date(2027, 6, 30) },
    ]);
  });

  it('counts a month-only date from the first of its month, and keeps it until the month ends', () => {
    const notices = outstandingDueNotices({
      keyDate: { precision: 'month', day: date(2028, 2, 1) },
      daysBefore: [30],
    });

    expect(notices).toEqual([
      { daysBefore: 30, remindOn: date(2028, 1, 2), lapsesOn: date(2028, 2, 29) },
    ]);
  });

  it('gives a rule repeated by mistake one due notice, earliest first', () => {
    const notices = outstandingDueNotices({
      keyDate: { precision: 'exact', day: date(2027, 6, 30) },
      daysBefore: [7, 30, 7],
    });

    expect(notices.map(({ daysBefore }) => daysBefore)).toEqual([30, 7]);
  });

  it('leaves out a notice once it, or one closer to the date, has gone out', () => {
    const keyDate = { precision: 'exact', day: date(2027, 6, 30) } as const;

    const afterTheWeekBefore = outstandingDueNotices({
      keyDate,
      daysBefore: [60, 30, 7, 1],
      deliveredDaysBefore: [7],
    });

    expect(afterTheWeekBefore.map(({ daysBefore }) => daysBefore)).toEqual([1]);
  });

  it('has nothing more to send once the user has handled the reminder', () => {
    const notices = outstandingDueNotices({
      keyDate: { precision: 'exact', day: date(2027, 6, 30) },
      daysBefore: [30, 7],
      handling: { status: 'handled' },
    });

    expect(notices).toEqual([]);
  });

  it('holds back what falls in a snooze until the day it ends, and lets go what that is too late for', () => {
    const keyDate = { precision: 'exact', day: date(2027, 6, 30) } as const;

    const snoozedAWeek = outstandingDueNotices({
      keyDate,
      daysBefore: [30, 7, 1],
      handling: { status: 'snoozed', until: date(2027, 6, 26) },
    });
    const snoozedPastTheDate = outstandingDueNotices({
      keyDate,
      daysBefore: [7],
      handling: { status: 'snoozed', until: date(2027, 7, 1) },
    });

    expect(snoozedAWeek).toEqual([
      { daysBefore: 30, remindOn: date(2027, 6, 26), lapsesOn: date(2027, 6, 30) },
      { daysBefore: 7, remindOn: date(2027, 6, 26), lapsesOn: date(2027, 6, 30) },
      { daysBefore: 1, remindOn: date(2027, 6, 29), lapsesOn: date(2027, 6, 30) },
    ]);
    expect(snoozedPastTheDate).toEqual([]);
  });
});
