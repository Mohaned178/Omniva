import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isRoleAtLeast } from '@omniva/domain-rules';
import type { MemberRole } from '@omniva/schemas';
import { WorkspaceMembers } from '../workspaces/workspace-members.js';
import { SessionRequired } from './errors/session-required.js';
import { WorkspaceAccessDenied } from './errors/workspace-access-denied.js';
import { WorkspaceGateMissing } from './errors/workspace-gate-missing.js';
import { WorkspaceNotFound } from './errors/workspace-not-found.js';
import { MINIMUM_ROLE, WORKSPACE_ID_PARAM } from './requires-role.decorator.js';
import type { SignedInRequest } from './signed-in-request.js';

/**
 * The application gate (spec, D3; ADR 0009): a request that names a workspace gets through
 * only for a member of it whose role is at least the endpoint's minimum. Runs after the
 * session guard, so the user is known.
 */
@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly members: WorkspaceMembers,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const minimumRole = this.reflector.get<MemberRole | undefined>(
      MINIMUM_ROLE,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<SignedInRequest>();
    const workspaceId = request.params[WORKSPACE_ID_PARAM];

    if (minimumRole === undefined) {
      // Fail closed: an endpoint that names a workspace must say which role it needs.
      if (workspaceId !== undefined) {
        throw new WorkspaceGateMissing('The endpoint needs @RequiresRole()');
      }
      return true;
    }
    if (typeof workspaceId !== 'string') {
      throw new WorkspaceGateMissing('The path names no workspace');
    }
    if (!request.signedInUser) throw new SessionRequired('Sign in to use this.');

    const { userId } = request.signedInUser;
    const role = await this.members.roleOf(userId, workspaceId);
    if (role === undefined) throw new WorkspaceNotFound('No such workspace.');
    if (!isRoleAtLeast(role, minimumRole)) {
      throw new WorkspaceAccessDenied('Your role in this workspace does not allow this.');
    }
    request.workspaceAccess = { workspaceId, userId, role };
    return true;
  }
}
