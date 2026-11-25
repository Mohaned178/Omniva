import { z } from 'zod';
import { LifeModuleSchema } from './life-module.js';

/**
 * Which records a module list shows: those whose home is the module, either the ones in use
 * or, with `archived`, the ones put away.
 */
export const RecordListQuerySchema = z.object({
  module: LifeModuleSchema,
  archived: z.stringbool().default(false),
});
export type RecordListQuery = z.infer<typeof RecordListQuerySchema>;
