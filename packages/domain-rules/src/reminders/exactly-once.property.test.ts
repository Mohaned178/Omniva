import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { CalendarDate } from '@omniva/domain-types';
import { noticeToDeliver } from './notice-to-deliver.js';
import {
  outstandingDueNotices,
  type DatedKeyDate,
  type DueNotice,
  type ReminderHandling,
} from './outstanding-due-notices.js';

// An independent oracle for the calendar: the platform's own UTC date arithmetic.
const MILLISECONDS_PER_DAY = 86_400_000;
const toTime = ({ year, month, day }: CalendarDate): number => Date.UTC(year, month - 1, day);
const fromTime = (time: number): CalendarDate => {
  const instant = new Date(time);
  return {
    year: instant.getUTCFullYear(),
    month: instant.getUTCMonth() + 1,
    day: instant.getUTCDate(),
  };
};
const plusDays = (date: CalendarDate, days: number): CalendarDate =>
  fromTime(toTime(date) + days * MILLISECONDS_PER_DAY);
const lastDayOf = ({ precision, day }: DatedKeyDate): CalendarDate =>
  precision === 'exact' ? day : fromTime(Date.UTC(day.year, day.month, 0));

const MAX_DAYS_BEFORE = 400;

const keyDates: fc.Arbitrary<DatedKeyDate> = fc
  .record({
    precision: fc.constantFrom('exact' as const, 'month' as const),
    offset: fc.integer({ min: 0, max: 3 * 365 }),
  })
  .map(({ precision, offset }) => {
    const day = plusDays({ year: 2027, month: 1, day: 1 }, offset);
    return { precision, day: precision === 'month' ? { ...day, day: 1 } : day };
  });

const handlings = (keyDate: DatedKeyDate): fc.Arbitrary<ReminderHandling> =>
  fc.oneof(
    fc.constant({ status: 'open' as const }),
    fc.constant({ status: 'handled' as const }),
    fc
      .integer({ min: -MAX_DAYS_BEFORE, max: 40 })
      .map((offset) => ({ status: 'snoozed' as const, until: plusDays(keyDate.day, offset) })),
  );

const rules = fc.array(fc.integer({ min: 0, max: MAX_DAYS_BEFORE }), { maxLength: 8 });

/** What happens next to the worker: a check some days on (0 = again the same day), or a rebuild. */
type Step = { readonly kind: 'check'; readonly gapDays: number } | { readonly kind: 'rebuild' };
const steps: fc.Arbitrary<readonly Step[]> = fc.array(
  fc.oneof(
    fc.record({ kind: fc.constant('check' as const), gapDays: fc.integer({ min: 0, max: 45 }) }),
    fc.constant({ kind: 'rebuild' as const }),
  ),
  { maxLength: 80 },
);

interface Delivery {
  readonly notice: DueNotice;
  readonly on: CalendarDate;
}

/**
 * The worker over time, as Omniva runs it: the schedule is rebuilt from the Key date, its rules
 * and what was delivered; each check delivers what is due and drops the notices it overtook.
 */
function runWorker(
  keyDate: DatedKeyDate,
  daysBefore: readonly number[],
  start: CalendarDate,
  handling: ReminderHandling = { status: 'open' },
) {
  const deliveries: Delivery[] = [];
  const rebuild = () =>
    outstandingDueNotices({
      keyDate,
      daysBefore,
      deliveredDaysBefore: deliveries.map(({ notice }) => notice.daysBefore),
      handling,
    });
  let schedule = rebuild();
  let today = start;
  const leftBehind: CalendarDate[] = [];

  const apply = (step: Step): void => {
    if (step.kind === 'rebuild') {
      schedule = rebuild();
      return;
    }
    today = plusDays(today, step.gapDays);
    const delivery = noticeToDeliver({ keyDate, notices: schedule, today });
    if (delivery) {
      deliveries.push({ notice: delivery.notice, on: today });
      const done = new Set([delivery.notice, ...delivery.overtaken]);
      schedule = schedule.filter((notice) => !done.has(notice));
    }
    // A check must leave nothing due behind it, in the live schedule or a rebuilt one.
    const stillDue =
      noticeToDeliver({ keyDate, notices: schedule, today }) ??
      noticeToDeliver({ keyDate, notices: rebuild(), today });
    if (stillDue) leftBehind.push(today);
  };
  return { apply, deliveries, leftBehind };
}

describe('each due notice is produced exactly once', () => {
  it('goes out at most once, on a day it is due and not snoozed, closer to the date each time, and no check leaves one behind', () => {
    fc.assert(
      fc.property(
        keyDates.chain((keyDate) => fc.tuple(fc.constant(keyDate), handlings(keyDate))),
        rules,
        steps,
        fc.integer({ min: 0, max: 460 }),
        ([keyDate, handling], daysBefore, plan, daysAhead) => {
          const start = plusDays(keyDate.day, -daysAhead);
          const worker = runWorker(keyDate, daysBefore, start, handling);
          plan.forEach(worker.apply);

          const sent = worker.deliveries.map(({ notice }) => notice.daysBefore);
          expect(new Set(sent).size).toBe(sent.length);
          expect(sent).toEqual([...sent].sort((a, b) => b - a));
          if (handling.status === 'handled') expect(sent).toEqual([]);
          for (const { notice, on } of worker.deliveries) {
            expect(toTime(on)).toBeGreaterThanOrEqual(
              toTime(plusDays(keyDate.day, -notice.daysBefore)),
            );
            if (handling.status === 'snoozed') {
              expect(toTime(on)).toBeGreaterThanOrEqual(toTime(handling.until));
            }
            expect(toTime(on)).toBeLessThanOrEqual(toTime(lastDayOf(keyDate)));
          }
          expect(worker.leftBehind).toEqual([]);
        },
      ),
    );
  });

  it('with a check every day, sends every rule’s notice exactly once, on its own day', () => {
    fc.assert(
      fc.property(keyDates, rules, fc.boolean(), (keyDate, daysBefore, checksTwiceADay) => {
        const start = plusDays(keyDate.day, -MAX_DAYS_BEFORE - 1);
        const worker = runWorker(keyDate, daysBefore, start);
        const lastDay = toTime(lastDayOf(keyDate));
        for (let time = toTime(start); time <= lastDay; time += MILLISECONDS_PER_DAY) {
          worker.apply({ kind: 'check', gapDays: time === toTime(start) ? 0 : 1 });
          if (checksTwiceADay) worker.apply({ kind: 'check', gapDays: 0 });
        }

        const expected = [...new Set(daysBefore)]
          .sort((a, b) => b - a)
          .map((days) => ({ daysBefore: days, on: plusDays(keyDate.day, -days) }));
        expect(
          worker.deliveries.map(({ notice, on }) => ({ daysBefore: notice.daysBefore, on })),
        ).toEqual(expected);
      }),
    );
  });
});
