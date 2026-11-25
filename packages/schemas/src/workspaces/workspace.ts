import { z } from 'zod';
import { MemberRoleSchema } from './member-role.js';
import { WorkspaceIdSchema } from './workspace-id.js';

/** A workspace as one of its members sees it, with their role in it. */
export const WorkspaceSchema = z
  .object({
    id: WorkspaceIdSchema,
    kind: z.enum(['personal', 'shared']),
    role: MemberRoleSchema,
  })
  .meta({ id: 'Workspace' });
export type Workspace = z.infer<typeof WorkspaceSchema>;
