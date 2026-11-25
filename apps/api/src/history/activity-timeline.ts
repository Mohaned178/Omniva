import { Injectable } from '@nestjs/common';
import type { ActivityAction, ActivityEntry } from '@omniva/schemas';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';

/** A change to note on the timeline. */
export interface TimelineChange {
  readonly workspaceId: string;
  readonly recordId: string;
  readonly action: ActivityAction;
  /** The user who made the change; null when Omniva made it. */
  readonly actorUserId: string | null;
  readonly occurredAt: Date;
}

/**
 * History's interface to the Activity Timeline (GLOSSARY.md). Every method works inside the
 * caller's workspace-scoped transaction, so an entry is saved with the change it describes or
 * not at all (ADR 0008).
 */
@Injectable()
export class ActivityTimeline {
  async note(transaction: DatabaseTransaction, change: TimelineChange): Promise<void> {
    await transaction.activityEntry.create({ data: change });
  }

  /** A record's own changes, oldest first. */
  async entriesFor(
    transaction: DatabaseTransaction,
    workspaceId: string,
    recordId: string,
  ): Promise<readonly ActivityEntry[]> {
    const entries = await transaction.activityEntry.findMany({
      where: { workspaceId, recordId },
      orderBy: [{ occurredAt: 'asc' }, { recordedAt: 'asc' }],
      select: { action: true, actorUserId: true, occurredAt: true },
    });
    return entries.map((entry) => ({ ...entry, occurredAt: entry.occurredAt.toISOString() }));
  }
}
