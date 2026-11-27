import { describe, expect, it } from 'vitest';
import type { CalendarDate } from '@omniva/domain-types';
import { noticeToDeliver } from './notice-to-deliver.js';
import { outstandingDueNotices } from './outstanding-due-notices.js';

const date = (year: number, month: number, day: number): CalendarDate => ({ year, month, day });

const RENEWAL = { precision: 'exact', day: date(2027, 6, 30) } as const;

describe('noticeToDeliver', () => {
  it('sends nothing before a notice’s day, and the notice on its day', () => {
    const notices = outstandingDueNotices({ keyDate: RENEWAL, daysBefore: [30] });

    expect(noticeToDeliver({ keyDate: RENEWAL, notices, today: date(2027, 5, 30) })).toBe(
      undefined,
    );
    expect(noticeToDeliver({ keyDate: RENEWAL, notices, today: date(2027, 5, 31) })).toEqual({
      notice: { daysBefore: 30, remindOn: date(2027, 5, 31), lapsesOn: date(2027, 6, 30) },
      overtaken: [],
      daysLeft: 30,
      isUrgent: false,
    });
  });

  it('sends only the notice closest to the date when several came due while Omniva was away', () => {
    const notices = outstandingDueNotices({ keyDate: RENEWAL, daysBefore: [60, 30, 7, 1] });

    const delivery = noticeToDeliver({ keyDate: RENEWAL, notices, today: date(2027, 6, 25) });

    expect(delivery?.notice.daysBefore).toBe(7);
    expect(delivery?.overtaken.map(({ daysBefore }) => daysBefore)).toEqual([60, 30]);
  });

  it('is urgent when the date is a week away or less, too close to wait for the weekly digest', () => {
    const notices = outstandingDueNotices({ keyDate: RENEWAL, daysBefore: [8, 7] });
    const urgencyOn = (today: CalendarDate) =>
      noticeToDeliver({ keyDate: RENEWAL, notices, today })?.isUrgent;

    expect(urgencyOn(date(2027, 6, 22))).toBe(false);
    expect(urgencyOn(date(2027, 6, 23))).toBe(true);
  });

  it('counts a month-only date from its first day, so it turns urgent early', () => {
    const march = { precision: 'month', day: date(2027, 3, 1) } as const;
    const notices = outstandingDueNotices({ keyDate: march, daysBefore: [30] });

    const midMonth = noticeToDeliver({ keyDate: march, notices, today: date(2027, 3, 10) });

    expect(midMonth).toEqual(expect.objectContaining({ daysLeft: -9, isUrgent: true }));
  });

  it('sends nothing once the date has passed', () => {
    const notices = outstandingDueNotices({ keyDate: RENEWAL, daysBefore: [30] });

    expect(noticeToDeliver({ keyDate: RENEWAL, notices, today: date(2027, 7, 1) })).toBe(undefined);
  });
});
