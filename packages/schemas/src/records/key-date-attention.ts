import { z } from 'zod';
import { FieldKeySchema } from './type-definition.js';
import { RecordIdSchema } from './record-id.js';
import { TypeKeySchema } from './type-key.js';

/** One Key date on the attention list: which record, which of its dates, and how it stands. */
export const KeyDateAttentionItemSchema = z
  .object({
    recordId: RecordIdSchema,
    recordTitle: z.string(),
    typeKey: TypeKeySchema,
    fieldKey: FieldKeySchema,
    precision: z.enum(['exact', 'month']),
    /** The exact day, or the first of the month for a month-only date. */
    date: z.iso.date(),
    /** Whole days from today; negative once the date has passed. */
    daysUntil: z.int(),
    /**
     * How its latest reminder reached the user: `email` once an urgent one's email has gone
     * through, `app` while that email has not yet, `digest` for one that waits for the digest.
     * Every reminder is in the app from the moment it comes. Null until one has come.
     */
    remindedVia: z.enum(['email', 'app', 'digest']).nullable(),
  })
  .meta({ id: 'KeyDateAttentionItem' });
export type KeyDateAttentionItem = z.infer<typeof KeyDateAttentionItemSchema>;

/** A Key date the user marked missing; shown gently until they fill it in. */
export const MissingKeyDateItemSchema = z
  .object({
    recordId: RecordIdSchema,
    recordTitle: z.string(),
    typeKey: TypeKeySchema,
    fieldKey: FieldKeySchema,
  })
  .meta({ id: 'MissingKeyDateItem' });
export type MissingKeyDateItem = z.infer<typeof MissingKeyDateItemSchema>;

/** What needs attention among a workspace's Key dates: what is coming, and what is missing. */
export const KeyDateAttentionListSchema = z
  .object({
    upcoming: z.array(KeyDateAttentionItemSchema),
    missing: z.array(MissingKeyDateItemSchema),
  })
  .meta({ id: 'KeyDateAttentionList' });
export type KeyDateAttentionList = z.infer<typeof KeyDateAttentionListSchema>;
