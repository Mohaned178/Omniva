import { setTimeout as sleep } from 'node:timers/promises';
import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import type { ComponentStatus } from '@omniva/schemas';
import { AppConfig } from '../platform/config/app-config.js';
import { JobQueue } from '../platform/jobs/job-queue.js';
import { HEALTH_PROBE_QUEUE, ensureHealthProbeQueue } from './health-probe-queue.js';

const POLL_INTERVAL_MS = 100;

/**
 * Proves the worker is taking jobs by sending one through pg-boss and waiting for it to
 * complete. Waiting uses wall-clock time on purpose: this is a technical timeout, not a
 * moment in a user's life, so it does not follow the injected Clock.
 */
@Injectable()
export class WorkerProbe implements OnApplicationBootstrap {
  constructor(
    private readonly jobs: JobQueue,
    private readonly config: AppConfig,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await ensureHealthProbeQueue(this.jobs.boss);
  }

  async status(): Promise<ComponentStatus> {
    const jobId = await this.jobs.boss.send(HEALTH_PROBE_QUEUE, {});
    if (jobId === null) return 'down';

    const deadline = Date.now() + this.config.workerProbeTimeoutMs;
    while (Date.now() < deadline) {
      if (await this.isCompleted(jobId)) return 'up';
      await sleep(POLL_INTERVAL_MS);
    }
    return 'down';
  }

  private async isCompleted(jobId: string): Promise<boolean> {
    const [job] = await this.jobs.boss.findJobs(HEALTH_PROBE_QUEUE, { id: jobId });
    return job?.state === 'completed';
  }
}
