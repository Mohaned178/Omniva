import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PgBoss } from 'pg-boss';
import { AppConfig } from '../config/app-config.js';
import { PROCESS_ROLE, type ProcessRole } from '../process-role.js';

const STOP_TIMEOUT_MS = 10_000;

export interface QueuePolicy {
  readonly retryLimit: number;
  /** How long a job may stay unfinished before pg-boss gives up on it. */
  readonly expireInSeconds: number;
  /** How long a finished job is kept before it is deleted. */
  readonly retentionSeconds: number;
}

export interface WorkOptions {
  readonly pollingIntervalSeconds: number;
}

/**
 * Durable background jobs stored in PostgreSQL with pg-boss (ADR 0015). Only the worker runs
 * pg-boss maintenance and cron scheduling; API instances just send jobs. pg-boss itself stays
 * private so callers depend on this port, not on the library (CODING_STANDARDS §3).
 */
@Injectable()
export class JobQueue implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobQueue.name);
  private readonly boss: PgBoss;

  constructor(config: AppConfig, @Inject(PROCESS_ROLE) role: ProcessRole) {
    const isWorker = role === 'worker';
    this.boss = new PgBoss({
      connectionString: config.databaseUrl,
      application_name: `omniva-${role}`,
      supervise: isWorker,
      schedule: isWorker,
    });
    this.boss.on('error', (error: Error) => {
      this.logger.error(`pg-boss error: ${error.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.boss.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.boss.stop({ graceful: true, timeout: STOP_TIMEOUT_MS });
  }

  /** Creates the queue if it is missing; safe to call from every process at start-up. */
  async declareQueue(queue: string, policy: QueuePolicy): Promise<void> {
    await this.boss.createQueue(queue, {
      retryLimit: policy.retryLimit,
      expireInSeconds: policy.expireInSeconds,
      retentionSeconds: policy.retentionSeconds,
      deleteAfterSeconds: policy.retentionSeconds,
    });
  }

  /** Returns the job's id, or undefined when pg-boss declined to create it. */
  async send(queue: string, data: object): Promise<string | undefined> {
    return (await this.boss.send(queue, data)) ?? undefined;
  }

  async isCompleted(queue: string, jobId: string): Promise<boolean> {
    const [job] = await this.boss.findJobs(queue, { id: jobId });
    return job?.state === 'completed';
  }

  /**
   * Runs the handler for each job on the queue. Job data comes back from the database, so the
   * handler receives it as `unknown` and parses it (CODING_STANDARDS �4). A handler that
   * throws fails the job, and pg-boss retries it under the queue's policy.
   */
  async work(
    queue: string,
    options: WorkOptions,
    handler: (data: unknown) => Promise<void>,
  ): Promise<void> {
    await this.boss.work(
      queue,
      { pollingIntervalSeconds: options.pollingIntervalSeconds },
      async (jobs) => {
        for (const job of jobs) await handler(job.data);
      },
    );
  }
}
