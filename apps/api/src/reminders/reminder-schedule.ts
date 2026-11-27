import { Injectable } from '@nestjs/common';
import { outstandingDueNotices } from '@omniva/domain-rules';
import { dateColumnOf } from '../platform/database/date-column.js';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';
import { ScopedDatabase } from '../platform/database/scoped-database.js';
import type { RemindableKeyDate } from '../records/key-dates/key-date-reader.js';
import { KeyDateReader } from '../records/key-dates/key-date-reader.js';
import { handlingOf, type StoredHandling } from './stored-handling.js';

/** One of a record's Key dates on one day, as its deliveries and handling are stored. */
interface StoredOccurrence {
  readonly fieldKey: string;
  readonly occursOn: Date;
}

interface StoredDelivery extends StoredOccurrence {
  readonly daysBefore: number;
}

/**
 * The derived schedule of due notices (ADR 0012), one record at a time. It is rebuilt from the
 * record's Key dates and their reminder rules, what was delivered and how the user handled each
 * reminder, so it can be emptied and rebuilt at any time (ADR 0008).
 */
@Injectable()
export class ReminderSchedule {
  constructor(
    private readonly database: ScopedDatabase,
    private readonly keyDates: KeyDateReader,
  ) {}

  /** Rebuilds the record's due notices as Omniva, in its workspace. */
  async rebuildFor(workspaceId: string, recordId: string): Promise<void> {
    await this.database.$scopedTransaction({ workspaceId }, (transaction) =>
      this.rebuild(transaction, workspaceId, recordId),
    );
  }

  /**
   * Makes the record's due notices exactly what its sources give, inside the caller's
   * transaction. An archived or deleted record has none. Safe to repeat.
   */
  async rebuild(
    transaction: DatabaseTransaction,
    workspaceId: string,
    recordId: string,
  ): Promise<void> {
    const keyDates = await this.keyDates.ofRecord(transaction, workspaceId, recordId);
    const deliveries = await transaction.reminderDelivery.findMany({
      where: { workspaceId, recordId },
      select: { fieldKey: true, occursOn: true, daysBefore: true },
    });
    const handlings = await transaction.reminderHandling.findMany({
      where: { workspaceId, recordId },
      select: { fieldKey: true, occursOn: true, status: true, snoozedUntil: true },
    });

    await transaction.reminderNotice.deleteMany({ where: { workspaceId, recordId } });
    const notices = keyDates.flatMap((keyDate) => noticeRowsOf(keyDate, deliveries, handlings));
    if (notices.length === 0) return;
    await transaction.reminderNotice.createMany({
      data: notices.map((notice) => ({ workspaceId, recordId, ...notice })),
    });
  }
}

/** The rows of one Key date's outstanding due notices, for the day it has now. */
function noticeRowsOf(
  keyDate: RemindableKeyDate,
  deliveries: readonly StoredDelivery[],
  handlings: readonly (StoredOccurrence & StoredHandling)[],
) {
  if (keyDate.date === undefined || keyDate.record.isArchived) return [];
  const occursOn = dateColumnOf(keyDate.date.day);
  const isThisOccurrence = (stored: StoredOccurrence): boolean =>
    stored.fieldKey === keyDate.fieldKey && stored.occursOn.getTime() === occursOn.getTime();

  return outstandingDueNotices({
    keyDate: keyDate.date,
    daysBefore: keyDate.reminderDaysBefore,
    deliveredDaysBefore: deliveries.filter(isThisOccurrence).map(({ daysBefore }) => daysBefore),
    handling: handlingOf(handlings.find(isThisOccurrence)),
  }).map(({ daysBefore, remindOn, lapsesOn }) => ({
    fieldKey: keyDate.fieldKey,
    occursOn,
    daysBefore,
    remindOn: dateColumnOf(remindOn),
    lapsesOn: dateColumnOf(lapsesOn),
  }));
}
