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
import { errorName } from '../platform/errors/error-name.js';
import { KeyDateReader, type RemindableKeyDate } from '../records/key-dates/key-date-reader.js';
import type { Occurrence } from './occurrence.js';
import { ReminderEmails, type UrgentReminder } from './reminder-emails.js';
import { handlingOf } from './stored-handling.js';

/**
 * Sending an email holds its delivery's row lock until the mail server answers, so it may take
 * as long as the server's own time limits allow (SmtpEmailSender) and some more.
 */
const EMAIL_TRANSACTION_TIMEOUT_MS = 60_000;

/** A Key date that has a day, as it is reminded of. */
type RemindableDate = RemindableKeyDate & { readonly date: DatedKeyDate };

/** What one check works with: the day it runs on, and where the workspace's reminders go. */
interface Sending {
  readonly today: CalendarDate;
  readonly recipients: readonly string[];
}

interface LockedNotice {
  readonly id: string;
  readonly daysBefore: number;
  readonly remindOn: Date;
  readonly lapsesOn: Date;
}

/** An urgent reminder delivered to the app whose email has not gone through yet. */
interface OwedEmail {
  readonly deliveryId: string;
  /** The due notice, kept until the email goes through, so each check tries again. */
  readonly noticeId: string;
  readonly reminder: UrgentReminder;
}

/**
 * Delivers due notices, each exactly once (ADR 0012), in two steps of their own. First a Key
 * date's due notices are locked, checked against the records once more and the one due is
 * recorded under its unique key: from that commit on it is in the app, whatever happens to its
 * email (spec D52). Then an urgent one's email is sent under its delivery's row lock and marked
 * sent in the same transaction, so a failed send is tried again at the next check and a second
 * worker passes over a send another holds. The one moment no design can close is between the
 * mail server accepting an email and that transaction committing: a crash there sends the email
 * again at the next check, with the same Message-ID so the mail system can tell. A rare repeat
 * is preferred to a reminder never sent (reliability before calm).
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
        // Left for the next check to try again; identifiers only in the log.
        this.logger.error(
          `A reminder in workspace ${workspaceId} was not delivered: ${errorName(error)}`,
        );
      }
    }
  }

  private async deliverOccurrence(
    workspaceId: string,
    occurrence: Occurrence,
    { today, recipients }: Sending,
  ): Promise<void> {
    const owed = await this.database.$scopedTransaction({ workspaceId }, (tx) =>
      this.deliverToApp(tx, workspaceId, occurrence, today),
    );
    if (owed !== undefined && recipients.length > 0) {
      await this.sendOwedEmail(workspaceId, owed, recipients);
    }
  }

  /**
   * Delivers the occurrence's due notice closest to its date to the app and drops the notices
   * it overtakes, and those the records no longer give. Resolves to the email still owed, if
   * the reminder is urgent and its email has not gone through.
   */
  private async deliverToApp(
    tx: DatabaseTransaction,
    workspaceId: string,
    occurrence: Occurrence,
    today: CalendarDate,
  ): Promise<OwedEmail | undefined> {
    const locked = await lockDueNotices(tx, workspaceId, occurrence, today);
    if (locked.length === 0) return undefined;
    const keyDate = await this.stillToRemind(tx, workspaceId, occurrence);
    const current = locked.filter(
      ({ daysBefore }) => keyDate?.reminderDaysBefore.includes(daysBefore) === true,
    );
    // The record moved on, the user handled it or changed its rules since it was scheduled;
    // its own rebuild schedules what it gives now.
    await deleteNotices(
      tx,
      locked.filter((notice) => !current.includes(notice)),
    );
    if (keyDate === undefined) return undefined;

    const ids = new Map(current.map((row) => [toDueNotice(row), row.id] as const));
    const delivery = noticeToDeliver({ keyDate: keyDate.date, notices: [...ids.keys()], today });
    if (delivery === undefined) return undefined;
    const recorded = await this.recordDelivery(tx, workspaceId, occurrence, delivery);
    const owesEmail = recorded.isUrgent && recorded.emailedAt === null;
    const idsOf = (notices: readonly DueNotice[]) =>
      notices.flatMap((notice) => {
        const id = ids.get(notice);
        return id === undefined ? [] : [{ id }];
      });
    // An email still owed keeps its notice, so the next check tries it again.
    await deleteNotices(
      tx,
      idsOf(owesEmail ? delivery.overtaken : [delivery.notice, ...delivery.overtaken]),
    );
    const [owedNotice] = idsOf([delivery.notice]);
    if (!owesEmail || owedNotice === undefined) return undefined;
    return {
      deliveryId: recorded.id,
      noticeId: owedNotice.id,
      reminder: {
        ...occurrence,
        daysBefore: delivery.notice.daysBefore,
        recordTitle: keyDate.record.title,
        keyDate: keyDate.date,
        daysLeft: delivery.daysLeft,
      },
    };
  }

  /**
   * The Key date as the records hold it now, if its reminder is still to come: the record is
   * in use, the date still falls on the scheduled day, and the user has not handled it. The
   * schedule is only rebuilt after a change is announced, so the records have the last word.
   */
  private async stillToRemind(
    tx: DatabaseTransaction,
    workspaceId: string,
    occurrence: Occurrence,
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
   * Records the delivery under its unique key (ADR 0012), or finds it there already, as when an
   * earlier check delivered it but its email failed, or a rebuild that raced a delivery
   * scheduled the notice again.
   */
  private async recordDelivery(
    tx: DatabaseTransaction,
    workspaceId: string,
    occurrence: Occurrence,
    delivery: NoticeDelivery,
  ) {
    const key = { ...occurrence, daysBefore: delivery.notice.daysBefore };
    await tx.reminderDelivery.createMany({
      data: {
        workspaceId,
        ...key,
        isUrgent: delivery.isUrgent,
        deliveredAt: this.clock.now(),
      },
      skipDuplicates: true,
    });
    return tx.reminderDelivery.findUniqueOrThrow({
      where: { recordId_fieldKey_occursOn_daysBefore: key },
      select: { id: true, isUrgent: true, emailedAt: true },
    });
  }

  /** Emails the reminder and marks it emailed in one transaction, unless another holds it. */
  private async sendOwedEmail(
    workspaceId: string,
    owed: OwedEmail,
    recipients: readonly string[],
  ): Promise<void> {
    await this.database.$scopedTransaction(
      { workspaceId },
      async (tx) => {
        const [unsent] = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM reminder_delivery
          WHERE workspace_id = ${workspaceId} AND id = ${owed.deliveryId} AND emailed_at IS NULL
          FOR UPDATE SKIP LOCKED`;
        if (unsent === undefined) return;
        await this.emails.send(recipients, owed.reminder);
        await tx.reminderDelivery.update({
          where: { id: owed.deliveryId },
          data: { emailedAt: this.clock.now() },
        });
        await deleteNotices(tx, [{ id: owed.noticeId }]);
      },
      { timeoutMs: EMAIL_TRANSACTION_TIMEOUT_MS },
    );
  }
}

/** Notices due today that have not lapsed. */
function dueOn(today: CalendarDate) {
  const day = dateColumnOf(today);
  return { remindOn: { lte: day }, lapsesOn: { gte: day } };
}

/**
 * Locks the occurrence's notices that are due by today. Rows another delivery holds are
 * skipped rather than waited for: that delivery either delivers them or leaves them for the
 * next check.
 */
async function lockDueNotices(
  tx: DatabaseTransaction,
  workspaceId: string,
  { recordId, fieldKey, occursOn }: Occurrence,
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
