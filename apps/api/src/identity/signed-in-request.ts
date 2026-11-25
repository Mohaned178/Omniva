import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import type { SignedInUser } from './authentication.js';
import type { WorkspaceAccess } from './workspace-access.js';

/**
 * A request the guards have let through, carrying who is signed in and, when it names a
 * workspace, their verified membership of it.
 */
export interface SignedInRequest extends Request {
  signedInUser?: SignedInUser;
  workspaceAccess?: WorkspaceAccess;
}

/** The request's headers in the Fetch API form Better Auth reads. */
export function requestHeaders(request: Request): Headers {
  return fromNodeHeaders(request.headers);
}
