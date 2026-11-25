import { z } from 'zod';

/** What happened to a record, as the Activity Timeline tells it. */
export const ACTIVITY_ACTIONS = ['created', 'updated', 'archived', 'unarchived'] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

/**
 * One change on the Activity Timeline. It refers to the record rather than copying its
 * content (ADR 0004).
 */
export const ActivityEntrySchema = z
  .object({
    action: z.enum(ACTIVITY_ACTIONS),
    /** The user who made the change; null when Omniva made it. */
    actorUserId: z.string().nullable(),
    occurredAt: z.iso.datetime(),
  })
  .meta({ id: 'ActivityEntry' });
export type ActivityEntry = z.infer<typeof ActivityEntrySchema>;

/** A record's own changes, oldest first (GLOSSARY.md, Activity Timeline). */
export const RecordHistorySchema = z
  .object({ entries: z.array(ActivityEntrySchema) })
  .meta({ id: 'RecordHistory' });
export type RecordHistory = z.infer<typeof RecordHistorySchema>;
