import { Injectable } from '@nestjs/common';
import { calendarDateOf, dayOfIso, isoDayOf, isSnoozeAhead } from '@omniva/domain-rules';
import type { ReminderStatus, SetReminderStatusRequest } from '@omniva/schemas';
import type { WorkspaceAccess } from '../identity/workspace-access.js';
import { Clock } from '../platform/clock/clock.js';
import { dateColumnOf } from '../platform/database/date-column.js';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';
import { ScopedDatabase } from '../platform/database/scoped-database.js';
import { KeyDateReader } from '../records/key-dates/key-date-reader.js';
import { KeyDateNotFound } from './errors/key-date-not-found.js';
import { SnoozeNotAhead } from './errors/snooze-not-ahead.js';
import type { Occurrence } from './occurrence.js';
import { ReminderSchedule } from './reminder-schedule.js';

/**
 * A member handling, snoozing or reopening a Key date's reminder (spec D57). The record's due
 * notices are rebuilt in the same transaction, so a handled or snoozed reminder cannot go out
 * a moment later.
 */
@Injectable()
export class ReminderStatuses {
  constructor(
    private readonly database: ScopedDatabase,
    private readonly keyDates: KeyDateReader,
    private readonly schedule: ReminderSchedule,
    private readonly clock: Clock,
  ) {}

  async set(
    access: WorkspaceAccess,
    { recordId, fieldKey }: { readonly recordId: string; readonly fieldKey: string },
    request: SetReminderStatusRequest,
  ): Promise<ReminderStatus> {
    const now = this.clock.now();
    const snoozedUntil = request.status === 'snoozed' ? request.until : null;
    if (snoozedUntil !== null && !isSnoozeAhead(dayOfIso(snoozedUntil), calendarDateOf(now))) {
      throw new SnoozeNotAhead('A snooze must end after today.');
    }
    return this.database.$scopedTransaction(access, async (transaction) => {
      const occurrence = await this.currentOccurrence(transaction, access.workspaceId, {
        recordId,
        fieldKey,
        date: request.date,
      });
      const where = { workspaceId: access.workspaceId, ...occurrence };
      // An open reminder is one the user has done nothing about, which has no row.
      if (request.status === 'open') {
        await transaction.reminderHandling.deleteMany({ where });
      } else {
        const handling = {
          status: request.status,
          snoozedUntil: snoozedUntil === null ? null : dateColumnOf(dayOfIso(snoozedUntil)),
          changedAt: now,
        };
        await transaction.reminderHandling.upsert({
          where: { recordId_fieldKey_occursOn: occurrence },
          create: { ...where, ...handling },
          update: handling,
        });
      }
      await this.schedule.rebuild(transaction, access.workspaceId, recordId);
      return { recordId, fieldKey, date: request.date, status: request.status, snoozedUntil };
    });
  }

  /** The Key date as the record has it now, which must fall on the day the user acted on. */
  private async currentOccurrence(
    transaction: DatabaseTransaction,
    workspaceId: string,
    { recordId, fieldKey, date }: { recordId: string; fieldKey: string; date: string },
  ): Promise<Occurrence> {
    const keyDate = (await this.keyDates.ofRecord(transaction, workspaceId, recordId)).find(
      (candidate) => candidate.fieldKey === fieldKey,
    );
    if (keyDate?.date === undefined || isoDayOf(keyDate.date.day) !== date) {
      throw new KeyDateNotFound('The record has no such Key date on that day.');
    }
    return { recordId, fieldKey, occursOn: dateColumnOf(keyDate.date.day) };
  }
}
