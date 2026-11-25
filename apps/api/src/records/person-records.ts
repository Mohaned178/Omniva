import { Injectable } from '@nestjs/common';
import type { DatabaseTransaction } from '../platform/database/database-transaction.js';

/** Every Person record is built on the Person building block. */
const PERSON_BLOCK = 'person';
/** The built-in Person Type; its home module is the People directory (Social & Relationships). */
const PERSON_TYPE_KEY = 'person';
/** Me starts with this title; the user may later change it to their name. */
const ME_TITLE = 'Me';

/** Records core's interface for Person records. */
@Injectable()
export class PersonRecords {
  /**
   * Creates the Person record that represents a member in their workspace ("Me"), inside the
   * caller's transaction, which must already be scoped to that workspace. Returns its id.
   */
  async createMe(transaction: DatabaseTransaction, workspaceId: string): Promise<string> {
    const me = await transaction.record.create({
      data: { workspaceId, block: PERSON_BLOCK, typeKey: PERSON_TYPE_KEY, title: ME_TITLE },
      select: { id: true },
    });
    return me.id;
  }
}
