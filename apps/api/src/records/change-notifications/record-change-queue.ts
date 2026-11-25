import type { JobQueue, QueuePolicy } from '../../platform/jobs/job-queue.js';

export const RECORD_CHANGE_QUEUE = 'records.record-changed';

/**
 * Derived data must catch up (ADR 0008), so a notification whose subscribers fail is retried
 * many times; the daily reconciliation repairs whatever still slips through.
 */
const RECORD_CHANGE_RETRY_LIMIT = 20;
const RECORD_CHANGE_EXPIRY_SECONDS = 15 * 60;
/** Holds identifiers only, so a day's worth is kept for diagnosing delivery. */
const RECORD_CHANGE_RETENTION_SECONDS = 24 * 60 * 60;

const RECORD_CHANGE_POLICY: QueuePolicy = {
  retryLimit: RECORD_CHANGE_RETRY_LIMIT,
  expireInSeconds: RECORD_CHANGE_EXPIRY_SECONDS,
  retentionSeconds: RECORD_CHANGE_RETENTION_SECONDS,
};

/** Both processes call this at start-up, since either may start first. */
export async function declareRecordChangeQueue(jobs: JobQueue): Promise<void> {
  await jobs.declareQueue(RECORD_CHANGE_QUEUE, RECORD_CHANGE_POLICY);
}
