import type { PgBoss } from 'pg-boss';

/** The queue the API uses to check that the worker is taking jobs. Probe jobs carry no data. */
export const HEALTH_PROBE_QUEUE = 'platform.health-probe';

/** Probe jobs are throwaway: nobody needs them a few minutes later. */
const HEALTH_PROBE_RETENTION_SECONDS = 300;

/** Both processes call this at start-up, since either may start first. */
export async function ensureHealthProbeQueue(boss: PgBoss): Promise<void> {
  await boss.createQueue(HEALTH_PROBE_QUEUE, {
    retryLimit: 0,
    expireInSeconds: HEALTH_PROBE_RETENTION_SECONDS,
    retentionSeconds: HEALTH_PROBE_RETENTION_SECONDS,
    deleteAfterSeconds: HEALTH_PROBE_RETENTION_SECONDS,
  });
}
