import { RecordFieldsSchema, ReminderRuleSchema, type RecordView } from '@omniva/schemas';
import { z } from 'zod';
import type { Prisma } from '../generated/prisma/client.js';
import type { WorkspaceAccess } from '../identity/workspace-access.js';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';
import { RecordNotFound } from './errors/record-not-found.js';

/** The columns a record is shown from. */
export const STORED_RECORD_SELECT = {
  id: true,
  typeKey: true,
  title: true,
  homeModule: true,
  lifecycleState: true,
  isArchived: true,
  fields: true,
  reminderRules: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.RecordSelect;

export type StoredRecord = Prisma.RecordGetPayload<{ select: typeof STORED_RECORD_SELECT }>;

/**
 * The record with this id in the access's workspace, inside the caller's scoped transaction.
 * The query names the workspace itself as well as relying on row-level security (ADR 0009).
 */
export async function storedRecordOf(
  transaction: DatabaseTransaction,
  access: WorkspaceAccess,
  recordId: string,
): Promise<StoredRecord> {
  const record = await transaction.record.findFirst({
    where: { id: recordId, workspaceId: access.workspaceId },
    select: STORED_RECORD_SELECT,
  });
  if (!record) throw new RecordNotFound('No such record.');
  return record;
}

const ReminderRulesColumnSchema = z.array(ReminderRuleSchema);

/** A stored record as the API shows it. */
export function toRecordView(record: StoredRecord): RecordView {
  return {
    ...record,
    // Written only after validation against the Type, but JSON comes back untyped (§4).
    fields: RecordFieldsSchema.parse(record.fields),
    reminderRules: ReminderRulesColumnSchema.parse(record.reminderRules),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
