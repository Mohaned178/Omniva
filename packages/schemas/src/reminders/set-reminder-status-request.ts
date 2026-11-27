import { z } from 'zod';

/** The Key date's day the user acted on, as the attention list shows it. */
const OccurrenceDaySchema = z.iso
  .date()
  .describe('The Key date’s day, the first of the month for a month-only date');

/**
 * What the user does about a Key date's reminder (GLOSSARY.md, Handled, Snoozed): mark it
 * handled, snooze it until a day ahead, or open it again. It applies to the date the Key date
 * has now, which the request names so a date that has just changed is not acted on unseen.
 */
export const SetReminderStatusRequestSchema = z
  .discriminatedUnion('status', [
    z.object({ date: OccurrenceDaySchema, status: z.literal('open') }),
    z.object({ date: OccurrenceDaySchema, status: z.literal('handled') }),
    z.object({
      date: OccurrenceDaySchema,
      status: z.literal('snoozed'),
      /** The day the reminder comes back; it must be ahead of today. */
      until: z.iso.date(),
    }),
  ])
  .meta({ id: 'SetReminderStatusRequest' });
export type SetReminderStatusRequest = z.infer<typeof SetReminderStatusRequestSchema>;
