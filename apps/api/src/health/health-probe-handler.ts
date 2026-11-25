import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { JobQueue } from '../platform/jobs/job-queue.js';
import { HEALTH_PROBE_QUEUE, ensureHealthProbeQueue } from './health-probe-queue.js';

/** Fast polling so a health check gets its answer well inside its timeout. */
const PROBE_POLLING_INTERVAL_SECONDS = 0.5;

/** Worker side of the health check: completing a probe job is the proof the worker is alive. */
@Injectable()
export class HealthProbeHandler implements OnApplicationBootstrap {
  constructor(private readonly jobs: JobQueue) {}

  async onApplicationBootstrap(): Promise<void> {
    await ensureHealthProbeQueue(this.jobs.boss);
    await this.jobs.boss.work(
      HEALTH_PROBE_QUEUE,
      { pollingIntervalSeconds: PROBE_POLLING_INTERVAL_SECONDS },
      async () => {
        // Nothing to do: being picked up and completed is the whole answer.
      },
    );
  }
}
