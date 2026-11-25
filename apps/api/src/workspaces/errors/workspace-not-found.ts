import { DomainError } from '../../platform/errors/domain-error.js';

/**
 * The workspace does not exist, or the user is not a member of it. The two look the same, so
 * nobody can learn which workspaces exist.
 */
export class WorkspaceNotFound extends DomainError {
  readonly kind = 'not-found';
  readonly code = 'WORKSPACE_NOT_FOUND';
}
