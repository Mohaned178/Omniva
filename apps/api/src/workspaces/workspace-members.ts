import { Injectable } from '@nestjs/common';
import type { MemberRole } from '@omniva/schemas';
import { ScopedDatabase } from '../platform/database/scoped-database.js';

/** A user and a workspace they might be a member of. */
export interface MembershipQuery {
  readonly userId: string;
  readonly workspaceId: string;
}

/** Who belongs to which workspace, with which role (GLOSSARY.md, Member). */
@Injectable()
export class WorkspaceMembers {
  constructor(private readonly database: ScopedDatabase) {}

  /** The user's role in the workspace, or undefined when they are not a member of it. */
  async roleOf({ userId, workspaceId }: MembershipQuery): Promise<MemberRole | undefined> {
    // Scoped to the user, PostgreSQL shows only their own memberships (ADR 0009).
    const member = await this.database.$scopedTransaction({ userId }, (transaction) =>
      transaction.member.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
        select: { role: true },
      }),
    );
    return member?.role;
  }

  /**
   * The users who are members of the workspace, for Omniva's own work on it, such as sending
   * its reminders. The transaction is scoped to the workspace, with no user acting.
   */
  async userIdsOf(workspaceId: string): Promise<readonly string[]> {
    const members = await this.database.$scopedTransaction({ workspaceId }, (transaction) =>
      transaction.member.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'asc' },
        select: { userId: true },
      }),
    );
    return members.map(({ userId }) => userId);
  }
}
