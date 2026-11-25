import { Injectable } from '@nestjs/common';
import type { ActivityAction } from '@omniva/schemas';
import { ActivityTimeline } from '../history/activity-timeline.js';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';
import { RecordChangeAnnouncer } from './change-notifications/record-change-announcer.js';

/** A change Records core made to one record. */
export interface RecordChange {
  readonly workspaceId: string;
  readonly recordId: string;
  readonly action: ActivityAction;
  /** The user who made the change; null when Omniva made it. */
  readonly actorUserId: string | null;
  readonly occurredAt: Date;
}

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

  async note(transaction: DatabaseTransaction, change: RecordChange): Promise<void> {
    await this.timeline.note(transaction, change);
    await this.announcer.announce(transaction, {
      workspaceId: change.workspaceId,
      recordId: change.recordId,
      action: change.action,
      occurredAt: change.occurredAt.toISOString(),
    });
  }
}
