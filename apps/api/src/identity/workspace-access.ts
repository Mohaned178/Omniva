import type { MemberRole } from '@omniva/schemas';

/**
 * The signed-in user's membership of the workspace a request names, as the workspace gate
 * verified it. Application services pass it on as the scope of their database transactions.
 */
export interface WorkspaceAccess {
  readonly workspaceId: string;
  readonly userId: string;
  readonly role: MemberRole;
}
