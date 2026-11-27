import { z } from 'zod';
import { RecordIdSchema } from '../records/record-id.js';
import { FieldKeySchema } from '../records/type-definition.js';

/** Where a Key date's reminder stands for the day the date has now. */
export const ReminderStatusSchema = z
  .object({
    recordId: RecordIdSchema,
    fieldKey: FieldKeySchema,
    /** The Key date's day, the first of the month for a month-only date. */
    date: z.iso.date(),
    status: z.enum(['open', 'handled', 'snoozed']),
    /** The day a snoozed reminder comes back; null unless it is snoozed. */
    snoozedUntil: z.iso.date().nullable(),
  })
  .meta({ id: 'ReminderStatus' });
export type ReminderStatus = z.infer<typeof ReminderStatusSchema>;
