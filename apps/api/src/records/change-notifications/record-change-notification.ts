import { ACTIVITY_ACTIONS } from '@omniva/schemas';
import { z } from 'zod';

/**
 * A durable change notification (ADR 0008): one change to one record, saved in the same
 * transaction as the change and passed on by the worker to every module that reacts to record
 * changes. Identifiers only, never record content (CODING_STANDARDS §7); a module that needs
 * the record reads it.
 */
export const RecordChangeNotificationSchema = z.object({
  workspaceId: z.string(),
  recordId: z.string(),
  action: z.enum(ACTIVITY_ACTIONS),
  occurredAt: z.iso.datetime(),
});
export type RecordChangeNotification = z.infer<typeof RecordChangeNotificationSchema>;
