/** What a Member may do in a workspace (GLOSSARY.md, Member). */
export const MEMBER_ROLES = ['owner', 'editor', 'viewer'] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];
