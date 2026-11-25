import { Injectable } from '@nestjs/common';
import type { CurrentSession } from '@omniva/schemas';
import { PersonalWorkspaces } from '../workspaces/personal-workspaces.js';
import type { SignedInUser } from './authentication.js';
import { SessionRequired } from './identity-errors.js';

/** Assembles what the app shell needs to know about the signed-in user. */
@Injectable()
export class CurrentSessionView {
  constructor(private readonly personalWorkspaces: PersonalWorkspaces) {}

  async for(user: SignedInUser): Promise<CurrentSession> {
    const membership = await this.personalWorkspaces.membershipOf(user.userId);
    // Verification provisions the workspace before any session exists, so a missing one
    // means the user's data was removed while they were signed in.
    if (!membership) throw new SessionRequired('Sign in again.');
    return {
      user: { id: user.userId, email: user.email },
      personalWorkspace: {
        id: membership.workspaceId,
        role: membership.role,
        mePersonId: membership.mePersonId,
      },
    };
  }
}
