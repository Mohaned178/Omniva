import { DomainError } from '../../platform/errors/domain-error.js';

/** The user is a member of the workspace, but their role does not allow this. */
export class WorkspaceAccessDenied extends DomainError {
  readonly kind = 'forbidden';
  readonly code = 'WORKSPACE_ACCESS_DENIED';
}
