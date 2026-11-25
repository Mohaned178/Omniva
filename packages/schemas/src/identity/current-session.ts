import { z } from 'zod';

const MemberRoleSchema = z.enum(['owner', 'editor', 'viewer']);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

/** Who is signed in, and the personal workspace they land in. */
export const CurrentSessionSchema = z
  .object({
    user: z.object({ id: z.string(), email: z.email() }),
    personalWorkspace: z.object({
      id: z.string(),
      role: MemberRoleSchema,
      /** The Person record representing the user in the workspace ("Me"). */
      mePersonId: z.string(),
    }),
  })
  .meta({ id: 'CurrentSession' });
export type CurrentSession = z.infer<typeof CurrentSessionSchema>;
