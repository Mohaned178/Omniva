import { randomUUID } from 'node:crypto';
import type { MemberRole } from '@omniva/schemas';
import { withDatabaseAdmin } from './database-admin.js';

export interface SharedMember {
  readonly userId: string;
  readonly role: MemberRole;
}

/**
 * A shared workspace with these members, each represented by a Person record, made directly in
 * the database: sharing comes after the MVP (spec, Out of Scope), but the gate already checks
 * every member's role (spec, D3). Returns the workspace's id.
 */
export async function sharedWorkspaceWith(members: readonly SharedMember[]): Promise<string> {
  const workspaceId = randomUUID();
  await withDatabaseAdmin(async (admin) => {
    await admin.query('BEGIN');
    await admin.query(`INSERT INTO workspace (id, kind) VALUES ($1, 'shared')`, [workspaceId]);
    for (const { userId, role } of members) {
      const personId = randomUUID();
      await admin.query(
        `INSERT INTO record (id, workspace_id, block, type_key, home_module, title, updated_at)
         VALUES ($1, $2, 'person', 'person', 'social', 'Member', now())`,
        [personId, workspaceId],
      );
      await admin.query(
        `INSERT INTO member (id, workspace_id, user_id, role, person_record_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), workspaceId, userId, role, personId],
      );
    }
    await admin.query('COMMIT');
  });
  return workspaceId;
}
