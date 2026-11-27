import { Injectable, Logger } from '@nestjs/common';
import {
  calendarDateOf,
  isoDayOf,
  noticeToDeliver,
  type DatedKeyDate,
  type DueNotice,
  type NoticeDelivery,
} from '@omniva/domain-rules';
import type { CalendarDate } from '@omniva/schemas';
import { Clock } from '../platform/clock/clock.js';
import { dateColumnOf } from '../platform/database/date-column.js';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';
import { ScopedDatabase } from '../platform/database/scoped-database.js';
import { KeyDateReader, type RemindableKeyDate } from '../records/key-dates/key-date-reader.js';
import { ReminderEmails } from './reminder-emails.js';
import { handlingOf } from './stored-handling.js';

/**
 * A delivery holds its notices' row locks while the email goes out, so it may take as long as
 * the mail server's own time limits allow (SmtpEmailSender) and some more.
 */
const DELIVERY_TRANSACTION_TIMEOUT_MS = 60_000;

/** One of a record's Key dates on one day, with notices due. */
interface DueOccurrence {
  readonly recordId: string;
  readonly fieldKey: string;
  readonly occursOn: Date;
}

/** A Key date that has a day, as it is reminded of. */
type RemindableDate = RemindableKeyDate & { readonly date: DatedKeyDate };

/** What one check sends with: the day it runs on, and where the workspace's reminders go. */
interface Sending {
  readonly today: CalendarDate;
  readonly recipients: readonly string[];
}

/** An occurrence whose due notices this delivery holds. */
interface LockedOccurrence {
  readonly workspaceId: string;
  readonly occurrence: DueOccurrence;
  readonly keyDate: RemindableDate;
  readonly locked: readonly LockedNotice[];
}

interface LockedNotice {
  readonly id: string;
  readonly daysBefore: number;
  readonly remindOn: Date;
  readonly lapsesOn: Date;
}

/**
 * Delivers due notices, each exactly once (ADR 0012). A Key date's due notices are taken in a
 * transaction of their own under row locks, checked against the records once more, recorded
 * under the delivery's unique key and only then emailed, all before the transaction commits:
 * a send that fails rolls everything back for the next check, and a second worker passes over
 * notices another holds.
 */
@Injectable()
export class ReminderDeliveries {
  private readonly logger = new Logger(ReminderDeliveries.name);

  constructor(
    private readonly database: ScopedDatabase,
    private readonly keyDates: KeyDateReader,
    private readonly emails: ReminderEmails,
    private readonly clock: Clock,
  ) {}

  /** Delivers whatever is due today, workspace by workspace. */
  async deliverDue(): Promise<void> {
    const today = calendarDateOf(this.clock.now());
    for (const workspaceId of await this.workspacesWithDueNotices(today)) {
      await this.deliverDueIn(workspaceId, today);
    }
  }

  /** The only look across workspaces: which have notices due, by id alone (ADR 0021). */
  private async workspacesWithDueNotices(today: CalendarDate): Promise<readonly string[]> {
    const rows = await this.database.$scopedTransaction({ task: 'reminders.find-due' }, (tx) =>
      tx.reminderNotice.findMany({
        where: dueOn(today),
        distinct: ['workspaceId'],
        select: { workspaceId: true },
      }),
    );
    return rows.map(({ workspaceId }) => workspaceId);
  }

  private async deliverDueIn(workspaceId: string, today: CalendarDate): Promise<void> {
    const occurrences = await this.database.$scopedTransaction({ workspaceId }, (tx) =>
      tx.reminderNotice.findMany({
        where: { workspaceId, ...dueOn(today) },
        distinct: ['recordId', 'fieldKey', 'occursOn'],
        select: { recordId: true, fieldKey: true, occursOn: true },
      }),
    );
    const recipients = await this.emails.recipientsOf(workspaceId);
    for (const occurrence of occurrences) {
      try {
        await this.deliverOccurrence(workspaceId, occurrence, { today, recipients });
      } catch (error) {
        // Left as it was, for the next check. Identifiers only: an email error can quote the
        // recipient's address (CODING_STANDARDS §7).
        this.logger.error(
          `A reminder in workspace ${workspaceId} was not delivered: ${errorName(error)}`,
        );
      }
    }
  }

  private async deliverOccurrence(
    workspaceId: string,
    occurrence: DueOccurrence,
    sending: Sending,
  ): Promise<void> {
    await this.database.$scopedTransaction(
      { workspaceId },
      async (tx) => {
        const locked = await lockDueNotices(tx, workspaceId, occurrence, sending.today);
        if (locked.length === 0) return;
        const keyDate = await this.stillToRemind(tx, workspaceId, occurrence);
        if (keyDate === undefined) {
          // The record moved on, or the user handled it, since it was scheduled.
          await deleteNotices(tx, locked);
          return;
        }
        await this.deliverDueNotice(tx, { workspaceId, occurrence, keyDate, locked }, sending);
      },
      { timeoutMs: DELIVERY_TRANSACTION_TIMEOUT_MS },
    );
  }

  /**
   * The Key date as the records hold it now, if its reminder is still to come: the record is
   * in use, the date still falls on the scheduled day, and the user has not handled it. The
   * schedule is only rebuilt after a change is announced, so the records have the last word.
   */
  private async stillToRemind(
    tx: DatabaseTransaction,
    workspaceId: string,
    occurrence: DueOccurrence,
  ): Promise<RemindableDate | undefined> {
    const keyDate = (await this.keyDates.ofRecord(tx, workspaceId, occurrence.recordId)).find(
      ({ fieldKey }) => fieldKey === occurrence.fieldKey,
    );
    const date = keyDate?.date;
    if (keyDate === undefined || date === undefined || keyDate.record.isArchived) return undefined;
    if (dateColumnOf(date.day).getTime() !== occurrence.occursOn.getTime()) return undefined;
    const handling = handlingOf(
      await tx.reminderHandling.findUnique({
        where: { recordId_fieldKey_occursOn: occurrence },
        select: { status: true, snoozedUntil: true },
      }),
    );
    return handling.status === 'handled' ? undefined : { ...keyDate, date };
  }

  /**
   * Delivers the locked notice closest to the date and drops those it overtakes. The email goes
   * out only after the delivery is recorded, inside the same transaction.
   */
  private async deliverDueNotice(
    tx: DatabaseTransaction,
    { workspaceId, occurrence, keyDate, locked }: LockedOccurrence,
    { today, recipients }: Sending,
  ): Promise<void> {
    const notices = new Map(
      locked
        .filter(({ daysBefore }) => keyDate.reminderDaysBefore.includes(daysBefore))
        .map((row) => [toDueNotice(row), row.id] as const),
    );
    const delivery = noticeToDeliver({
      keyDate: keyDate.date,
      notices: [...notices.keys()],
      today,
    });
    if (delivery === undefined) return;

    const isFirstDelivery = await this.recordDelivery(tx, workspaceId, occurrence, delivery);
    await deleteNotices(
      tx,
      [delivery.notice, ...delivery.overtaken].flatMap((notice) => {
        const id = notices.get(notice);
        return id === undefined ? [] : [{ id }];
      }),
    );
    // Delivered once already under its key, or not urgent: it waits for the digest.
    if (!isFirstDelivery || !delivery.isUrgent) return;
    await this.emails.send(recipients, {
      recordId: occurrence.recordId,
      fieldKey: occurrence.fieldKey,
      daysBefore: delivery.notice.daysBefore,
      recordTitle: keyDate.record.title,
      keyDate: keyDate.date,
      daysLeft: delivery.daysLeft,
    });
  }

  /**
   * Records the delivery under its unique key (ADR 0012). Resolves to false when that key was
   * delivered already, as when a rebuild that raced a delivery scheduled the notice again.
   */
  private async recordDelivery(
    tx: DatabaseTransaction,
    workspaceId: string,
    occurrence: DueOccurrence,
    delivery: NoticeDelivery,
  ): Promise<boolean> {
    const { count } = await tx.reminderDelivery.createMany({
      data: {
        workspaceId,
        ...occurrence,
        daysBefore: delivery.notice.daysBefore,
        isUrgent: delivery.isUrgent,
        deliveredAt: this.clock.now(),
      },
      skipDuplicates: true,
    });
    return count === 1;
  }
}

/** Notices due today that have not lapsed. */
function dueOn(today: CalendarDate) {
  const day = dateColumnOf(today);
  return { remindOn: { lte: day }, lapsesOn: { gte: day } };
}

/**
 * Locks the occurrence's notices that are due by today. Rows another delivery holds are
 * skipped rather than waited for: that delivery either sends them or leaves them for the next
 * check.
 */
async function lockDueNotices(
  tx: DatabaseTransaction,
  workspaceId: string,
  { recordId, fieldKey, occursOn }: DueOccurrence,
  today: CalendarDate,
): Promise<readonly LockedNotice[]> {
  return tx.$queryRaw<LockedNotice[]>`
    SELECT id, days_before AS "daysBefore", remind_on AS "remindOn", lapses_on AS "lapsesOn"
    FROM reminder_notice
    WHERE workspace_id = ${workspaceId} AND record_id = ${recordId} AND field_key = ${fieldKey}
      AND occurs_on = ${isoDayOf(calendarDateOf(occursOn))}::date
      AND remind_on <= ${isoDayOf(today)}::date
    FOR UPDATE SKIP LOCKED`;
}

async function deleteNotices(
  tx: DatabaseTransaction,
  notices: readonly { readonly id: string }[],
): Promise<void> {
  if (notices.length === 0) return;
  await tx.reminderNotice.deleteMany({ where: { id: { in: notices.map(({ id }) => id) } } });
}

function toDueNotice({ daysBefore, remindOn, lapsesOn }: LockedNotice): DueNotice {
  return { daysBefore, remindOn: calendarDateOf(remindOn), lapsesOn: calendarDateOf(lapsesOn) };
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : 'unknown error';
}
