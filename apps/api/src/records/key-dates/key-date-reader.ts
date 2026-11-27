import { Injectable } from '@nestjs/common';
import { calendarDateOf, type DatedKeyDate } from '@omniva/domain-rules';
import type { CalendarDate } from '@omniva/schemas';
import type { Prisma } from '../../generated/prisma/client.js';
import { dateColumnOf } from '../../platform/database/date-column.js';
import type { DatabaseTransaction } from '../../platform/database/database-transaction.js';

/** A record's Key date as reminders see it. */
export interface RemindableKeyDate {
  readonly recordId: string;
  readonly fieldKey: string;
  /** Undefined when the user marked the date missing. */
  readonly date: DatedKeyDate | undefined;
  /** When its reminders come, as days before it. */
  readonly reminderDaysBefore: readonly number[];
  readonly record: {
    readonly title: string;
    readonly typeKey: string;
    readonly isArchived: boolean;
  };
}

const REMINDABLE_SELECT = {
  recordId: true,
  fieldKey: true,
  precision: true,
  date: true,
  reminderDaysBefore: true,
  record: { select: { title: true, typeKey: true, isArchived: true } },
} as const satisfies Prisma.KeyDateSelect;

/** Which Key dates the attention list may show. */
export interface AttentionWindow {
  /** Dates on these days, inclusive. */
  readonly from: CalendarDate;
  readonly to: CalendarDate;
  /** Records whose Key dates are wanted wherever they fall, such as those reminded of. */
  readonly alsoOfRecords: readonly string[];
}

type KeyDateRow = Prisma.KeyDateGetPayload<{ select: typeof REMINDABLE_SELECT }>;

/**
 * Records core's interface for reading the Key-date collection, for Scheduling & Reminders
 * (CODING_STANDARDS §3, interface segregation). It works inside the caller's scoped
 * transaction, so what it reads is consistent with what the caller then writes.
 */
@Injectable()
export class KeyDateReader {
  /** The Key dates of one record, in field order; none when the record is gone. */
  async ofRecord(
    transaction: DatabaseTransaction,
    workspaceId: string,
    recordId: string,
  ): Promise<readonly RemindableKeyDate[]> {
    const rows = await transaction.keyDate.findMany({
      where: { workspaceId, recordId },
      orderBy: { fieldKey: 'asc' },
      select: REMINDABLE_SELECT,
    });
    return rows.map(toRemindable);
  }

  /**
   * The Key dates of the workspace's records in use that fall in the window, those marked
   * missing, and all of the records asked for, soonest first. Archived records are put away,
   * so their dates are left out.
   */
  async inAttentionWindow(
    transaction: DatabaseTransaction,
    workspaceId: string,
    { from, to, alsoOfRecords }: AttentionWindow,
  ): Promise<readonly RemindableKeyDate[]> {
    const rows = await transaction.keyDate.findMany({
      where: {
        workspaceId,
        record: { isArchived: false },
        OR: [
          { precision: 'missing' },
          { date: { gte: dateColumnOf(from), lte: dateColumnOf(to) } },
          { recordId: { in: [...alsoOfRecords] } },
        ],
      },
      orderBy: [{ date: 'asc' }, { recordId: 'asc' }, { fieldKey: 'asc' }],
      select: REMINDABLE_SELECT,
    });
    return rows.map(toRemindable);
  }
}

function toRemindable(row: KeyDateRow): RemindableKeyDate {
  return {
    recordId: row.recordId,
    fieldKey: row.fieldKey,
    date:
      row.precision === 'missing' || row.date === null
        ? undefined
        : { precision: row.precision, day: calendarDateOf(row.date) },
    reminderDaysBefore: row.reminderDaysBefore,
    record: row.record,
  };
}
