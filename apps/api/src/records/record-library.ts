import { Injectable } from '@nestjs/common';
import type { RecordHistory, RecordListQuery, RecordView } from '@omniva/schemas';
import { ActivityTimeline } from '../history/activity-timeline.js';
import type { WorkspaceAccess } from '../identity/workspace-access.js';
import { ScopedDatabase } from '../platform/database/scoped-database.js';
import { STORED_RECORD_SELECT, storedRecordOf, toRecordView } from './stored-record.js';

/** A member finding records in their workspace. */
@Injectable()
export class RecordLibrary {
  constructor(
    private readonly database: ScopedDatabase,
    private readonly timeline: ActivityTimeline,
  ) {}

  /** The records whose home is the module, newest first. */
  async list(access: WorkspaceAccess, query: RecordListQuery): Promise<readonly RecordView[]> {
    const records = await this.database.$scopedTransaction(access, (transaction) =>
      transaction.record.findMany({
        where: {
          workspaceId: access.workspaceId,
          homeModule: query.module,
          isArchived: query.archived,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        select: STORED_RECORD_SELECT,
      }),
    );
    return records.map(toRecordView);
  }

  /** The record's own changes on the Activity Timeline, oldest first. */
  async history(access: WorkspaceAccess, recordId: string): Promise<RecordHistory> {
    return this.database.$scopedTransaction(access, async (transaction) => {
      await storedRecordOf(transaction, access, recordId);
      const entries = await this.timeline.entriesFor(transaction, access.workspaceId, recordId);
      return { entries: [...entries] };
    });
  }

  async get(access: WorkspaceAccess, recordId: string): Promise<RecordView> {
    const record = await this.database.$scopedTransaction(access, (transaction) =>
      storedRecordOf(transaction, access, recordId),
    );
    return toRecordView(record);
  }
}
