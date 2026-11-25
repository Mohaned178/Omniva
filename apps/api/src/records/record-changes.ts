import { isDeepStrictEqual } from 'node:util';
import { Injectable } from '@nestjs/common';
import { initialLifecycleState } from '@omniva/domain-rules';
import {
  recordFieldsSchemaFor,
  type ActivityAction,
  type CreateRecordRequest,
  type RecordFields,
  type RecordView,
  type TypeDefinition,
  type UpdateRecordRequest,
} from '@omniva/schemas';
import type { WorkspaceAccess } from '../identity/workspace-access.js';
import { Clock } from '../platform/clock/clock.js';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';
import { ScopedDatabase } from '../platform/database/scoped-database.js';
import { parseInput } from '../platform/validation/parse-input.js';
import { UnknownType } from './errors/unknown-type.js';
import { RecordChangeLog } from './record-change-log.js';
import {
  STORED_RECORD_SELECT,
  storedRecordOf,
  toRecordView,
  type StoredRecord,
} from './stored-record.js';
import { TypeCatalog } from './type-catalog.js';

/**
 * A member creating and changing records in their workspace. Each change is noted in the
 * same transaction that makes it (ADR 0008).
 */
@Injectable()
export class RecordChanges {
  constructor(
    private readonly database: ScopedDatabase,
    private readonly types: TypeCatalog,
    private readonly changeLog: RecordChangeLog,
    private readonly clock: Clock,
  ) {}

  /** Creates a record of a Type; it lives in the Type's home module from the start. */
  async create(access: WorkspaceAccess, request: CreateRecordRequest): Promise<RecordView> {
    const type = this.typeCalled(request.typeKey);
    const fields = validFields(type, request.fields);
    const now = this.clock.now();
    return this.database.$scopedTransaction(access, async (transaction) => {
      const record = await transaction.record.create({
        data: {
          workspaceId: access.workspaceId,
          block: type.block,
          typeKey: type.key,
          homeModule: type.homeModule,
          title: request.title,
          lifecycleState: initialLifecycleState(type.block) ?? null,
          fields,
          createdAt: now,
          updatedAt: now,
        },
        select: STORED_RECORD_SELECT,
      });
      await this.noteChange(transaction, access, record, 'created');
      return toRecordView(record);
    });
  }

  /**
   * Changes a record's title or fields; new fields replace the old ones as a whole. An edit
   * that leaves everything as it was is not a change, so nothing is noted.
   */
  async update(
    access: WorkspaceAccess,
    recordId: string,
    request: UpdateRecordRequest,
  ): Promise<RecordView> {
    return this.database.$scopedTransaction(access, async (transaction) => {
      const current = toRecordView(await storedRecordOf(transaction, access, recordId));
      const title = request.title ?? current.title;
      const fields =
        request.fields === undefined
          ? current.fields
          : validFields(this.typeCalled(current.typeKey), request.fields);
      if (title === current.title && isDeepStrictEqual(fields, current.fields)) return current;
      const record = await transaction.record.update({
        where: { id: recordId },
        data: { title, fields, updatedAt: this.clock.now() },
        select: STORED_RECORD_SELECT,
      });
      await this.noteChange(transaction, access, record, 'updated');
      return toRecordView(record);
    });
  }

  /**
   * Puts a record away (GLOSSARY.md, Archived), keeping everything: its fields, lifecycle
   * state, links and history.
   */
  async archive(access: WorkspaceAccess, recordId: string): Promise<RecordView> {
    return this.changeArchived(access, recordId, { isArchived: true, action: 'archived' });
  }

  /** Brings an archived record back into use. */
  async unarchive(access: WorkspaceAccess, recordId: string): Promise<RecordView> {
    return this.changeArchived(access, recordId, { isArchived: false, action: 'unarchived' });
  }

  /** Asking for the state a record is already in changes nothing, so nothing is noted. */
  private async changeArchived(
    access: WorkspaceAccess,
    recordId: string,
    { isArchived, action }: { readonly isArchived: boolean; readonly action: ActivityAction },
  ): Promise<RecordView> {
    return this.database.$scopedTransaction(access, async (transaction) => {
      const existing = await storedRecordOf(transaction, access, recordId);
      if (existing.isArchived === isArchived) return toRecordView(existing);
      const record = await transaction.record.update({
        where: { id: recordId },
        data: { isArchived, updatedAt: this.clock.now() },
        select: STORED_RECORD_SELECT,
      });
      await this.noteChange(transaction, access, record, action);
      return toRecordView(record);
    });
  }

  /** Notes the change the member just made to the record, inside its transaction. */
  private async noteChange(
    transaction: DatabaseTransaction,
    access: WorkspaceAccess,
    record: StoredRecord,
    action: ActivityAction,
  ): Promise<void> {
    await this.changeLog.note(transaction, {
      workspaceId: access.workspaceId,
      recordId: record.id,
      action,
      actorUserId: access.userId,
      occurredAt: record.updatedAt,
    });
  }

  private typeCalled(typeKey: string): TypeDefinition {
    const type = this.types.find(typeKey);
    if (!type) throw new UnknownType('No Type has this key.');
    return type;
  }
}

/** The fields, validated against the record's Type definition (ADR 0011). */
function validFields(type: TypeDefinition, fields: RecordFields): RecordFields {
  return parseInput(recordFieldsSchemaFor(type), fields);
}
