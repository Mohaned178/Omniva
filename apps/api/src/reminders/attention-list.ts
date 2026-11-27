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
import type { Occurrence } from './occurrence.js';
import { handlingOf, type StoredHandling } from './stored-handling.js';

/** What has happened to the workspace's reminders that are not handled. */
interface ReminderState {
  /** The latest delivery of each occurrence, which says how it was reminded last. */
  readonly deliveries: readonly LatestDelivery[];
  readonly handlings: readonly (Occurrence & StoredHandling)[];
}

interface LatestDelivery extends Occurrence {
  readonly isUrgent: boolean;
  readonly emailedAt: Date | null;
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
  return {
    // Handled ones are left out: they are off the list for good, so they need not be read.
    deliveries: await transaction.$queryRaw<LatestDelivery[]>`
      SELECT DISTINCT ON (d.record_id, d.field_key, d.occurs_on)
             d.record_id AS "recordId", d.field_key AS "fieldKey", d.occurs_on AS "occursOn",
             d.is_urgent AS "isUrgent", d.emailed_at AS "emailedAt"
      FROM reminder_delivery d
      WHERE d.workspace_id = ${workspaceId}
        AND NOT EXISTS (
          SELECT 1 FROM reminder_handling h
          WHERE h.record_id = d.record_id AND h.field_key = d.field_key
            AND h.occurs_on = d.occurs_on AND h.status = 'handled')
      ORDER BY d.record_id, d.field_key, d.occurs_on, d.delivered_at DESC, d.days_before ASC`,
    handlings: await transaction.reminderHandling.findMany({
      where: { workspaceId },
      select: { recordId: true, fieldKey: true, occursOn: true, status: true, snoozedUntil: true },
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
      remindedVia: latest === undefined ? null : remindedViaOf(latest),
    },
  ];
}

/** An urgent reminder is emailed, and in the app until its email has gone through. */
function remindedViaOf({
  isUrgent,
  emailedAt,
}: LatestDelivery): KeyDateAttentionItem['remindedVia'] {
  if (!isUrgent) return 'digest';
  return emailedAt === null ? 'app' : 'email';
}

/** Whether a delivery or handling belongs to this Key date on the day it has now. */
function sameOccurrenceAs(keyDate: RemindableKeyDate, date: DatedKeyDate) {
  const occursOn = dateColumnOf(date.day).getTime();
  return (stored: Occurrence): boolean =>
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
