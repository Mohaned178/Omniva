import { setTimeout as sleep } from 'node:timers/promises';
import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import type { ComponentStatus } from '@omniva/schemas';
import { AppConfig } from '../platform/config/app-config.js';
import { JobQueue } from '../platform/jobs/job-queue.js';
import { HEALTH_PROBE_QUEUE, declareHealthProbeQueue } from './health-probe-queue.js';

const POLL_INTERVAL_MS = 100;

/**
 * Proves the worker is taking jobs by sending one through the job queue and waiting for it
 * to complete. Waiting uses wall-clock time on purpose: this is a technical timeout, not a
 * moment in a user's life, so it does not follow the injected Clock.
 */
@Injectable()
export class WorkerProbe implements OnApplicationBootstrap {
  constructor(
    private readonly jobs: JobQueue,
    private readonly config: AppConfig,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await declareHealthProbeQueue(this.jobs);
  }

  async status(): Promise<ComponentStatus> {
    const jobId = await this.jobs.send(HEALTH_PROBE_QUEUE, {});
    if (jobId === undefined) return 'down';

    const deadline = Date.now() + this.config.workerProbeTimeoutMs;
    while (Date.now() < deadline) {
      if (await this.jobs.isCompleted(HEALTH_PROBE_QUEUE, jobId)) return 'up';
      await sleep(POLL_INTERVAL_MS);
    }
    return 'down';
  }
}
