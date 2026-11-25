import type { MemberRole } from '@omniva/domain-types';

/** Each role may do everything the roles below it may: Owner, then Editor, then Viewer. */
const RANK: Readonly<Record<MemberRole, number>> = { viewer: 0, editor: 1, owner: 2 };

/** Whether a member with this role may do something that needs at least the minimum role. */
export function isRoleAtLeast(role: MemberRole, minimum: MemberRole): boolean {
  return RANK[role] >= RANK[minimum];
}
