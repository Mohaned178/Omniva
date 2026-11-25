import { Injectable } from '@nestjs/common';
import type { Workspace } from '@omniva/schemas';
import { WorkspaceNotFound } from '../identity/errors/workspace-not-found.js';
import type { WorkspaceAccess } from '../identity/workspace-access.js';
import { ScopedDatabase } from '../platform/database/scoped-database.js';

/** A workspace as one of its members sees it. */
@Injectable()
export class WorkspaceView {
  constructor(private readonly database: ScopedDatabase) {}

  async forMember(access: WorkspaceAccess): Promise<Workspace> {
    const workspace = await this.database.$scopedTransaction(access, (transaction) =>
      transaction.workspace.findUnique({
        where: { id: access.workspaceId },
        select: { id: true, kind: true },
      }),
    );
    // The gate found the membership a moment ago, so the workspace has been deleted since.
    if (!workspace) throw new WorkspaceNotFound('No such workspace.');
    return { ...workspace, role: access.role };
  }
}
