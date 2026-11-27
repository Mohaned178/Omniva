import { Injectable } from '@nestjs/common';
import { collectKeyDates, type CollectedKeyDate } from '@omniva/domain-rules';
import type { RecordFields, TypeDefinition } from '@omniva/schemas';
import type { DatabaseTransaction } from '../../platform/database/database-transaction.js';

interface RecordKeyDates {
  readonly workspaceId: string;
  readonly recordId: string;
  readonly type: TypeDefinition;
  readonly fields: RecordFields;
}

/**
 * The one Key-date collection, which Records core keeps in step with each record's date
 * fields (spec, Records core). Reminders, the calendar and the Overview read only from it. It
 * is derived from the records, so replacing a record's rows is safe to repeat (ADR 0008).
 */
@Injectable()
export class KeyDateCollection {
  /** Makes the record's rows exactly the Key dates its fields hold, inside the change's transaction. */
  async keepInStepWith(
    transaction: DatabaseTransaction,
    { workspaceId, recordId, type, fields }: RecordKeyDates,
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
        date: dateColumnOf(keyDate),
      })),
    });
  }
}

/** The day as a date column: midnight UTC, with no time or zone of its own. */
function dateColumnOf(keyDate: CollectedKeyDate): Date | null {
  if (keyDate.precision === 'missing') return null;
  const { year, month, day } = keyDate.day;
  return new Date(Date.UTC(year, month - 1, day));
}
