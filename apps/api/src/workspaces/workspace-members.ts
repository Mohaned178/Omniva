import { Injectable } from '@nestjs/common';
import type { MemberRole } from '@omniva/schemas';
import { ScopedDatabase } from '../platform/database/scoped-database.js';

/** Who belongs to which workspace, with which role (GLOSSARY.md, Member). */
@Injectable()
export class WorkspaceMembers {
  constructor(private readonly database: ScopedDatabase) {}

  /** The user's role in the workspace, or undefined when they are not a member of it. */
  async roleOf(userId: string, workspaceId: string): Promise<MemberRole | undefined> {
    // Scoped to the user, PostgreSQL shows only their own memberships (ADR 0009).
    const member = await this.database.$scopedTransaction({ userId }, (transaction) =>
      transaction.member.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
        select: { role: true },
      }),
    );
    return member?.role;
  }
}
