import { Injectable } from '@nestjs/common';
import { collectKeyDates, type CollectedKeyDate } from '@omniva/domain-rules';
import type { RecordFields, ReminderRule, TypeDefinition } from '@omniva/schemas';
import { dateColumnOf } from '../../platform/database/date-column.js';
import type { DatabaseTransaction } from '../../platform/database/database-transaction.js';

interface RecordKeyDates {
  readonly workspaceId: string;
  readonly recordId: string;
  readonly type: TypeDefinition;
  readonly fields: RecordFields;
  readonly reminderRules: readonly ReminderRule[];
}

/**
 * The one Key-date collection, which Records core keeps in step with each record's date
 * fields and reminder rules (spec, Records core). Reminders, the calendar and the Overview
 * read only from it. It is derived from the records, so replacing a record's rows is safe to
 * repeat (ADR 0008).
 */
@Injectable()
export class KeyDateCollection {
  /** Makes the record's rows exactly the Key dates its fields hold, inside the change's transaction. */
  async keepInStepWith(
    transaction: DatabaseTransaction,
    { workspaceId, recordId, type, fields, reminderRules }: RecordKeyDates,
  ): Promise<void> {
    await transaction.keyDate.deleteMany({ where: { recordId, workspaceId } });
    const keyDates = collectKeyDates(type.keyDateFields, fields);
    if (keyDates.length === 0) return;
    await transaction.keyDate.createMany({
      data: keyDates.map((keyDate) => ({
        workspaceId,
        recordId,
        fieldKey: keyDate.field,
        precision: keyDate.precision,
        date: keyDate.precision === 'missing' ? null : dateColumnOf(keyDate.day),
        reminderDaysBefore: daysBeforeOf(reminderRules, keyDate),
      })),
    });
  }
}

/** The lead times of the record's reminder rules for one of its Key dates. */
function daysBeforeOf(rules: readonly ReminderRule[], keyDate: CollectedKeyDate): number[] {
  return rules
    .filter(({ keyDateField }) => keyDateField === keyDate.field)
    .map(({ daysBefore }) => daysBefore);
}
