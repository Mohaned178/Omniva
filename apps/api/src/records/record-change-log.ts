import { Injectable } from '@nestjs/common';
import { ActivityTimeline, type TimelineChange } from '../history/activity-timeline.js';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';
import { RecordChangeAnnouncer } from './change-notifications/record-change-announcer.js';

/**
 * Notes each change to a record inside the transaction that makes it (ADR 0008,
 * CODING_STANDARDS §2): its Activity Timeline entry and its durable change notification, so
 * the change, its history and its announcement are saved together or not at all.
 */
@Injectable()
export class RecordChangeLog {
  constructor(
    private readonly timeline: ActivityTimeline,
    private readonly announcer: RecordChangeAnnouncer,
  ) {}

  async note(transaction: DatabaseTransaction, change: TimelineChange): Promise<void> {
    await this.timeline.note(transaction, change);
    await this.announcer.announce(transaction, {
      workspaceId: change.workspaceId,
      recordId: change.recordId,
      action: change.action,
      occurredAt: change.occurredAt.toISOString(),
    });
  }
}
