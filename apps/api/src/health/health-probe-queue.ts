import type { JobQueue, QueuePolicy } from '../platform/jobs/job-queue.js';

/** The queue the API uses to check that the worker is taking jobs. Probe jobs carry no data. */
export const HEALTH_PROBE_QUEUE = 'platform.health-probe';

/** A probe nobody picked up within a minute has failed; never retry it. */
const HEALTH_PROBE_EXPIRY_SECONDS = 60;
/** Finished probes are throwaway, so the table holds only a few minutes of them. */
const HEALTH_PROBE_RETENTION_SECONDS = 300;

const HEALTH_PROBE_POLICY: QueuePolicy = {
  retryLimit: 0,
  expireInSeconds: HEALTH_PROBE_EXPIRY_SECONDS,
  retentionSeconds: HEALTH_PROBE_RETENTION_SECONDS,
};

/** Both processes call this at start-up, since either may start first. */
export async function declareHealthProbeQueue(jobs: JobQueue): Promise<void> {
  await jobs.declareQueue(HEALTH_PROBE_QUEUE, HEALTH_PROBE_POLICY);
}
