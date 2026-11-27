import { z } from 'zod';
import { LifeModuleSchema } from './life-module.js';
import { LifecycleStateSchema } from './lifecycle-state.js';
import { RecordFieldsSchema } from './record-fields.js';
import { RecordIdSchema } from './record-id.js';
import { ReminderRuleSchema } from './type-definition.js';
import { TypeKeySchema } from './type-key.js';

/** A record with its anatomy (spec, Domain model). */
export const RecordSchema = z
  .object({
    id: RecordIdSchema,
    typeKey: TypeKeySchema,
    title: z.string(),
    /** Decided by the Type; never chosen by the user. */
    homeModule: LifeModuleSchema,
    /** Null for a building block with no lifecycle, such as a Person. */
    lifecycleState: LifecycleStateSchema.nullable(),
    isArchived: z.boolean(),
    fields: RecordFieldsSchema,
    /** When reminders come for the record's Key dates; a new record starts with its Type's. */
    reminderRules: z.array(ReminderRuleSchema),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .meta({ id: 'Record' });
/** Named apart from TypeScript's built-in `Record`, which it would otherwise shadow. */
export type RecordView = z.infer<typeof RecordSchema>;

export const RecordListSchema = z
  .object({ records: z.array(RecordSchema) })
  .meta({ id: 'RecordList' });
export type RecordList = z.infer<typeof RecordListSchema>;
