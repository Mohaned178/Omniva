import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { MemberRole } from '@omniva/schemas';
import { ScopedDatabase } from '../platform/database/scoped-database.js';
import { PersonRecords } from '../records/person-records.js';

export interface PersonalMembership {
  readonly workspaceId: string;
  readonly role: MemberRole;
  readonly mePersonId: string;
}

/** Every user has exactly one personal workspace, which they own (GLOSSARY.md). */
@Injectable()
export class PersonalWorkspaces {
  constructor(
    private readonly database: ScopedDatabase,
    private readonly personRecords: PersonRecords,
  ) {}

  /**
   * Creates the user's personal workspace, their Owner membership and their Me record in one
   * transaction. Safe to call again: a user who already has one keeps it, so a provisioning
   * step that failed can simply be retried.
   */
  async provisionFor(userId: string): Promise<void> {
    if (await this.membershipOf(userId)) return;

    // The id is chosen first so the transaction can be scoped to the new workspace (ADR 0009).
    const workspaceId = randomUUID();
    try {
      await this.database.$scopedTransaction({ workspaceId, userId }, async (transaction) => {
        await transaction.workspace.create({
          data: { id: workspaceId, kind: 'personal', personalOwnerUserId: userId },
        });
        const mePersonId = await this.personRecords.createMe(transaction, workspaceId);
        await transaction.member.create({
          data: { workspaceId, userId, role: 'owner', personRecordId: mePersonId },
        });
      });
    } catch (error) {
      // Two provisioning attempts raced and the other one won: the workspace exists.
      if (await this.membershipOf(userId)) return;
      throw error;
    }
  }

  /** The user's membership of their personal workspace, if it exists yet. */
  async membershipOf(userId: string): Promise<PersonalMembership | undefined> {
    const member = await this.database.$scopedTransaction({ userId }, (transaction) =>
      transaction.member.findFirst({
        where: { userId, workspace: { personalOwnerUserId: userId } },
        select: { workspaceId: true, role: true, personRecordId: true },
      }),
    );
    if (!member) return undefined;
    return {
      workspaceId: member.workspaceId,
      role: member.role,
      mePersonId: member.personRecordId,
    };
  }
}
