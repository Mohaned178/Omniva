import { Injectable } from '@nestjs/common';
import { Clock } from '../platform/clock/clock.js';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';
import { RecordChangeLog } from './record-change-log.js';

/** Every Person record is built on the Person building block. */
const PERSON_BLOCK = 'person';
/** The built-in Person Type; its home module is the People directory (Social & Relationships). */
const PERSON_TYPE_KEY = 'person';
const PERSON_HOME_MODULE = 'social';
/** Me starts with this title; the user may later change it to their name. */
const ME_TITLE = 'Me';

/** Records core's interface for Person records. */
@Injectable()
export class PersonRecords {
  constructor(
    private readonly changeLog: RecordChangeLog,
    private readonly clock: Clock,
  ) {}

  /**
   * Creates the Person record that represents a member in their workspace ("Me"), inside the
   * caller's transaction, which must already be scoped to that workspace. Omniva creates it,
   * not the user, and its history says so. Returns its id.
   */
  async createMe(transaction: DatabaseTransaction, workspaceId: string): Promise<string> {
    const now = this.clock.now();
    const me = await transaction.record.create({
      data: {
        workspaceId,
        block: PERSON_BLOCK,
        typeKey: PERSON_TYPE_KEY,
        homeModule: PERSON_HOME_MODULE,
        title: ME_TITLE,
        createdAt: now,
        updatedAt: now,
      },
      select: { id: true },
    });
    await this.changeLog.note(transaction, {
      workspaceId,
      recordId: me.id,
      action: 'created',
      actorUserId: null,
      occurredAt: now,
    });
    return me.id;
  }
}
