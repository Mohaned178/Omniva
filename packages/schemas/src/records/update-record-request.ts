import { z } from 'zod';
import { AcknowledgeImplausibleDatesSchema } from './acknowledge-implausible-dates.js';
import { RecordFieldsSchema } from './record-fields.js';
import { RecordReminderRulesSchema } from './record-reminder-rules.js';
import { RecordTitleSchema } from './record-title.js';

/**
 * A change to a record. `fields`, when given, replaces all of the record's fields, so a field
 * left out is cleared; `reminderRules` likewise replaces all of its reminder rules.
 */
export const UpdateRecordRequestSchema = z
  .object({
    title: RecordTitleSchema.optional(),
    fields: RecordFieldsSchema.optional(),
    reminderRules: RecordReminderRulesSchema.optional(),
    acknowledgeImplausibleDates: AcknowledgeImplausibleDatesSchema,
  })
  .refine(
    ({ title, fields, reminderRules }) =>
      title !== undefined || fields !== undefined || reminderRules !== undefined,
    { error: 'Nothing to change' },
  )
  .meta({ id: 'UpdateRecordRequest' });
export type UpdateRecordRequest = z.infer<typeof UpdateRecordRequestSchema>;
