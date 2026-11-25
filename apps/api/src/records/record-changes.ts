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
      return this.noted(transaction, access, record, 'created');
    });
  }

  /** Changes a record's title or fields; new fields replace the old ones as a whole. */
  async update(
    access: WorkspaceAccess,
    recordId: string,
    request: UpdateRecordRequest,
  ): Promise<RecordView> {
    return this.database.$scopedTransaction(access, async (transaction) => {
      const { typeKey } = await storedRecordOf(transaction, access, recordId);
      const record = await transaction.record.update({
        where: { id: recordId },
        data: {
          ...(request.title !== undefined && { title: request.title }),
          ...(request.fields !== undefined && {
            fields: validFields(this.typeCalled(typeKey), request.fields),
          }),
          updatedAt: this.clock.now(),
        },
        select: STORED_RECORD_SELECT,
      });
      return this.noted(transaction, access, record, 'updated');
    });
  }

  /**
   * Archives or unarchives a record (GLOSSARY.md, Archived). Archiving puts it away and keeps
   * everything: its fields, lifecycle state, links and history. Asking for the state it is
   * already in changes nothing, so nothing is noted.
   */
  async setArchived(
    access: WorkspaceAccess,
    recordId: string,
    isArchived: boolean,
  ): Promise<RecordView> {
    return this.database.$scopedTransaction(access, async (transaction) => {
      const existing = await storedRecordOf(transaction, access, recordId);
      if (existing.isArchived === isArchived) return toRecordView(existing);
      const record = await transaction.record.update({
        where: { id: recordId },
        data: { isArchived, updatedAt: this.clock.now() },
        select: STORED_RECORD_SELECT,
      });
      return this.noted(transaction, access, record, isArchived ? 'archived' : 'unarchived');
    });
  }

  /** Notes the change just made to the record, inside its transaction, and shows the record. */
  private async noted(
    transaction: DatabaseTransaction,
    access: WorkspaceAccess,
    record: StoredRecord,
    action: ActivityAction,
  ): Promise<RecordView> {
    await this.changeLog.note(transaction, {
      workspaceId: access.workspaceId,
      recordId: record.id,
      action,
      actorUserId: access.userId,
      occurredAt: record.updatedAt,
    });
    return toRecordView(record);
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
