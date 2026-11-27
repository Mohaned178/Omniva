import { z } from 'zod';
import { AcknowledgeImplausibleDatesSchema } from './acknowledge-implausible-dates.js';
import { RecordFieldsSchema } from './record-fields.js';
import { RecordTitleSchema } from './record-title.js';

/**
 * A change to a record. `fields`, when given, replaces all of the record's fields, so a field
 * left out is cleared.
 */
export const UpdateRecordRequestSchema = z
  .object({
    title: RecordTitleSchema.optional(),
    fields: RecordFieldsSchema.optional(),
    acknowledgeImplausibleDates: AcknowledgeImplausibleDatesSchema,
  })
  .refine(({ title, fields }) => title !== undefined || fields !== undefined, {
    error: 'Nothing to change',
  })
  .meta({ id: 'UpdateRecordRequest' });
export type UpdateRecordRequest = z.infer<typeof UpdateRecordRequestSchema>;
