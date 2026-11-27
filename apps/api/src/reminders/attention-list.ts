import { Injectable } from '@nestjs/common';
import {
  addCalendarDays,
  ATTENTION_LOOKAHEAD_DAYS,
  ATTENTION_LOOKBACK_DAYS,
  calendarDateOf,
  dayNumberOf,
  isoDayOf,
  type DatedKeyDate,
  type ReminderHandling,
} from '@omniva/domain-rules';
import type { CalendarDate, KeyDateAttentionItem, KeyDateAttentionList } from '@omniva/schemas';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';
import type { WorkspaceAccess } from '../identity/workspace-access.js';
import { Clock } from '../platform/clock/clock.js';
import { dateColumnOf } from '../platform/database/date-column.js';
import { ScopedDatabase } from '../platform/database/scoped-database.js';
import { KeyDateReader, type RemindableKeyDate } from '../records/key-dates/key-date-reader.js';
import { handlingOf, type StoredHandling } from './stored-handling.js';

/** One of a record's Key dates on one day, as reminder deliveries and handling store it. */
interface StoredOccurrence {
  readonly recordId: string;
  readonly fieldKey: string;
  readonly occursOn: Date;
}

/** What has happened to the workspace's reminders: what was delivered and how it was handled. */
interface ReminderState {
  /** The latest first, so the first found for a date is how it was reminded last. */
  readonly deliveries: readonly (StoredOccurrence & { readonly isUrgent: boolean })[];
  readonly handlings: readonly (StoredOccurrence & StoredHandling)[];
}

interface AttentionDays {
  readonly today: CalendarDate;
  readonly from: CalendarDate;
  readonly to: CalendarDate;
}

/**
 * The attention list's Key dates (GLOSSARY.md; spec D44, D52, D124): what is coming up or just
 * passed, what is missing, and every date a reminder has come for, which stays until the user
 * handles it. A handled date leaves the list; a snoozed one is off it until the snooze ends.
 */
@Injectable()
export class AttentionList {
  constructor(
    private readonly database: ScopedDatabase,
    private readonly keyDates: KeyDateReader,
    private readonly clock: Clock,
  ) {}

  async list(access: WorkspaceAccess): Promise<KeyDateAttentionList> {
    const today = calendarDateOf(this.clock.now());
    const days: AttentionDays = {
      today,
      from: addCalendarDays(today, -ATTENTION_LOOKBACK_DAYS),
      to: addCalendarDays(today, ATTENTION_LOOKAHEAD_DAYS),
    };
    return this.database.$scopedTransaction(access, async (transaction) => {
      const state = await reminderStateOf(transaction, access.workspaceId);
      const keyDates = await this.keyDates.inAttentionWindow(transaction, access.workspaceId, {
        from: days.from,
        to: days.to,
        alsoOfRecords: [...new Set(state.deliveries.map(({ recordId }) => recordId))],
      });
      return {
        upcoming: keyDates.flatMap((keyDate) => upcomingItemOf(keyDate, state, days)),
        missing: keyDates.filter(({ date }) => date === undefined).map(itemOf),
      };
    });
  }
}

async function reminderStateOf(
  transaction: DatabaseTransaction,
  workspaceId: string,
): Promise<ReminderState> {
  const occurrence = { recordId: true, fieldKey: true, occursOn: true } as const;
  return {
    deliveries: await transaction.reminderDelivery.findMany({
      where: { workspaceId },
      orderBy: [{ deliveredAt: 'desc' }, { daysBefore: 'asc' }],
      select: { ...occurrence, isUrgent: true },
    }),
    handlings: await transaction.reminderHandling.findMany({
      where: { workspaceId },
      select: { ...occurrence, status: true, snoozedUntil: true },
    }),
  };
}

function itemOf(keyDate: RemindableKeyDate) {
  return {
    recordId: keyDate.recordId,
    recordTitle: keyDate.record.title,
    typeKey: keyDate.record.typeKey,
    fieldKey: keyDate.fieldKey,
  };
}

/**
 * The Key date as an item coming up, if it belongs on the list: it is not handled or snoozed,
 * and it falls in the window or a reminder has come for it.
 */
function upcomingItemOf(
  keyDate: RemindableKeyDate,
  { deliveries, handlings }: ReminderState,
  { today, from, to }: AttentionDays,
): KeyDateAttentionItem[] {
  if (keyDate.date === undefined) return [];
  const isThisOccurrence = sameOccurrenceAs(keyDate, keyDate.date);
  if (!isOnList(handlingOf(handlings.find(isThisOccurrence)), today)) return [];
  const latest = deliveries.find(isThisOccurrence);
  if (latest === undefined && !isWithin(keyDate.date.day, { from, to })) return [];
  return [
    {
      ...itemOf(keyDate),
      precision: keyDate.date.precision,
      date: isoDayOf(keyDate.date.day),
      daysUntil: dayNumberOf(keyDate.date.day) - dayNumberOf(today),
      remindedVia: latest === undefined ? null : latest.isUrgent ? 'email' : 'digest',
    },
  ];
}

/** Whether a delivery or handling belongs to this Key date on the day it has now. */
function sameOccurrenceAs(keyDate: RemindableKeyDate, date: DatedKeyDate) {
  const occursOn = dateColumnOf(date.day).getTime();
  return (stored: StoredOccurrence): boolean =>
    stored.recordId === keyDate.recordId &&
    stored.fieldKey === keyDate.fieldKey &&
    stored.occursOn.getTime() === occursOn;
}

/** A handled date is off the list for good; a snoozed one until its snooze ends. */
function isOnList(handling: ReminderHandling, today: CalendarDate): boolean {
  switch (handling.status) {
    case 'open':
      return true;
    case 'handled':
      return false;
    case 'snoozed':
      return dayNumberOf(handling.until) <= dayNumberOf(today);
    default: {
      const unknownStatus: never = handling;
      return unknownStatus;
    }
  }
}

function isWithin(
  day: CalendarDate,
  { from, to }: { readonly from: CalendarDate; readonly to: CalendarDate },
): boolean {
  const number = dayNumberOf(day);
  return dayNumberOf(from) <= number && number <= dayNumberOf(to);
}
