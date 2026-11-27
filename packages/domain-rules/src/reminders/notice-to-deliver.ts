import type { CalendarDate } from '@omniva/domain-types';
import { dayNumberOf } from '../calendar/day-number.js';
import type { DatedKeyDate, DueNotice } from './outstanding-due-notices.js';

/**
 * A reminder whose date is this close can't wait for the weekly digest, so it notifies the
 * user directly (GLOSSARY.md, Urgent reminder). The weekly digest is the default cadence.
 */
export const URGENT_WITHIN_DAYS = 7;

export interface DeliveryCheck {
  readonly keyDate: DatedKeyDate;
  /** The Key date's outstanding due notices. */
  readonly notices: readonly DueNotice[];
  readonly today: CalendarDate;
}

/** The due notice to deliver today for one Key date. */
export interface NoticeDelivery {
  readonly notice: DueNotice;
  /** Notices due as well, which the one delivered makes needless. */
  readonly overtaken: readonly DueNotice[];
  /** Whole days from today to the Key date; a month-only date counts from its first day. */
  readonly daysLeft: number;
  readonly isUrgent: boolean;
}

/**
 * Which of a Key date's due notices goes out today, if any: of those due and not yet lapsed,
 * the one closest to the date. When several came due together, as after Omniva was away, one
 * reminder is enough and the earlier ones are overtaken.
 */
export function noticeToDeliver({
  keyDate,
  notices,
  today,
}: DeliveryCheck): NoticeDelivery | undefined {
  const todayNumber = dayNumberOf(today);
  const due = notices
    .filter(
      ({ remindOn, lapsesOn }) =>
        dayNumberOf(remindOn) <= todayNumber && todayNumber <= dayNumberOf(lapsesOn),
    )
    .sort((a, b) => b.daysBefore - a.daysBefore);
  const notice = due.at(-1);
  if (notice === undefined) return undefined;
  const daysLeft = dayNumberOf(keyDate.day) - todayNumber;
  return {
    notice,
    overtaken: due.slice(0, -1),
    daysLeft,
    isUrgent: daysLeft <= URGENT_WITHIN_DAYS,
  };
}
