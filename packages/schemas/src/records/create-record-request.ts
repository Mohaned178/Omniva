import { z } from 'zod';
import { AcknowledgeImplausibleDatesSchema } from './acknowledge-implausible-dates.js';
import { RecordFieldsSchema } from './record-fields.js';
import { RecordTitleSchema } from './record-title.js';
import { TypeKeySchema } from './type-key.js';

/** A new record of a Type; the fields are validated against that Type's definition. */
export const CreateRecordRequestSchema = z
  .object({
    typeKey: TypeKeySchema,
    title: RecordTitleSchema,
    fields: RecordFieldsSchema,
    acknowledgeImplausibleDates: AcknowledgeImplausibleDatesSchema,
  })
  .meta({ id: 'CreateRecordRequest' });
export type CreateRecordRequest = z.infer<typeof CreateRecordRequestSchema>;
