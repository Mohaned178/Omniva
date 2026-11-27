import type { CalendarDate } from '@omniva/domain-types';
import { addCalendarDays } from '../calendar/add-calendar-days.js';
import { dayNumberOf } from '../calendar/day-number.js';
import { daysInMonth } from '../calendar/days-in-month.js';

/** A Key date that has a day: an exact day, or the first of the month for a month-only date. */
export interface DatedKeyDate {
  readonly precision: 'exact' | 'month';
  readonly day: CalendarDate;
}

/** One reminder waiting for its day (GLOSSARY.md, Due notice). */
export interface DueNotice {
  /** The reminder rule it comes from: this many days before the Key date. */
  readonly daysBefore: number;
  /** The day it is due. */
  readonly remindOn: CalendarDate;
  /** The last day it may still go out: once the Key date has passed, it is no reminder. */
  readonly lapsesOn: CalendarDate;
}

/** What the user has done about a Key date's reminder (GLOSSARY.md, Handled, Snoozed). */
export type ReminderHandling =
  | { readonly status: 'open' }
  | { readonly status: 'handled' }
  | { readonly status: 'snoozed'; readonly until: CalendarDate };

export interface DueNoticeSources {
  readonly keyDate: DatedKeyDate;
  /** The Key date's reminder rules, as days before it. */
  readonly daysBefore: readonly number[];
  /** The rules whose notice for this same date has already gone out. */
  readonly deliveredDaysBefore?: readonly number[];
  readonly handling?: ReminderHandling;
}

const OPEN: ReminderHandling = { status: 'open' };

/**
 * The due notices still to come for one Key date, earliest first: one per reminder rule, less
 * those already delivered and those a delivered notice closer to the date has overtaken. A
 * month-only date counts from the first of its month, so its reminders come early enough
 * whatever the day turns out to be (spec D43). A handled reminder has none left; a snoozed one
 * holds back whatever falls before the snooze ends.
 */
export function outstandingDueNotices({
  keyDate,
  daysBefore,
  deliveredDaysBefore = [],
  handling = OPEN,
}: DueNoticeSources): readonly DueNotice[] {
  if (handling.status === 'handled') return [];
  const lapsesOn = latestDayOf(keyDate);
  // With nothing delivered yet the minimum is Infinity, so every rule is still to come.
  const closestDelivered = Math.min(...deliveredDaysBefore);
  return [...new Set(daysBefore)]
    .filter((days) => days < closestDelivered)
    .sort((a, b) => b - a)
    .map((days) => ({
      daysBefore: days,
      remindOn: heldBackBy(handling, addCalendarDays(keyDate.day, -days)),
      lapsesOn,
    }))
    .filter(({ remindOn }) => dayNumberOf(remindOn) <= dayNumberOf(lapsesOn));
}

/** The day a notice is due once a snooze has held it back. */
function heldBackBy(handling: ReminderHandling, remindOn: CalendarDate): CalendarDate {
  if (handling.status !== 'snoozed') return remindOn;
  return dayNumberOf(handling.until) > dayNumberOf(remindOn) ? handling.until : remindOn;
}

/** The last day the Key date may fall on: the day itself, or a month-only date's month end. */
function latestDayOf({ precision, day }: DatedKeyDate): CalendarDate {
  switch (precision) {
    case 'exact':
      return day;
    case 'month':
      return { ...day, day: daysInMonth(day.year, day.month) };
    default: {
      const unknownPrecision: never = precision;
      throw new Error(`Unknown precision ${String(unknownPrecision)}`);
    }
  }
}
