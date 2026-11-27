import { z } from 'zod';
import { AcknowledgeImplausibleDatesSchema } from './acknowledge-implausible-dates.js';
import { RecordFieldsSchema } from './record-fields.js';
import { RecordReminderRulesSchema } from './record-reminder-rules.js';
import { RecordTitleSchema } from './record-title.js';
import { TypeKeySchema } from './type-key.js';

/**
 * A new record of a Type; the fields and reminder rules are validated against that Type's
 * definition. Without reminder rules, the record gets its Type's defaults.
 */
export const CreateRecordRequestSchema = z
  .object({
    typeKey: TypeKeySchema,
    title: RecordTitleSchema,
    fields: RecordFieldsSchema,
    reminderRules: RecordReminderRulesSchema.optional(),
    acknowledgeImplausibleDates: AcknowledgeImplausibleDatesSchema,
  })
  .meta({ id: 'CreateRecordRequest' });
export type CreateRecordRequest = z.infer<typeof CreateRecordRequestSchema>;
