import { z } from 'zod';

/** Identifies a workspace: a random UUID, never guessable (spec, D4). */
export const WorkspaceIdSchema = z.uuid().meta({ id: 'WorkspaceId' });
