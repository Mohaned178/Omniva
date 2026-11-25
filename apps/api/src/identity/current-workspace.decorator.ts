import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { WorkspaceGateMissing } from './errors/workspace-gate-missing.js';
import type { SignedInRequest } from './signed-in-request.js';
import type { WorkspaceAccess } from './workspace-access.js';

/** The membership the workspace gate verified; only for endpoints marked @RequiresRole(). */
export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, context: ExecutionContext): WorkspaceAccess => {
    const { workspaceAccess } = context.switchToHttp().getRequest<SignedInRequest>();
    if (!workspaceAccess) {
      throw new WorkspaceGateMissing('@CurrentWorkspace() needs @RequiresRole()');
    }
    return workspaceAccess;
  },
);
