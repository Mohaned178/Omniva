import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PgBoss } from 'pg-boss';
import { AppConfig } from '../config/app-config.js';
import type { DatabaseTransaction } from '../database/database-transaction.js';
import { PROCESS_ROLE, type ProcessRole } from '../process-role.js';

const STOP_TIMEOUT_MS = 10_000;

export interface QueuePolicy {
  readonly retryLimit: number;
  /** How long a job may stay unfinished before pg-boss gives up on it. */
  readonly expireInSeconds: number;
  /** How long a finished job is kept before it is deleted. */
  readonly retentionSeconds: number;
}

export interface SendOptions {
  /** Identifies the work itself; a second job with the same key is not created. */
  readonly uniqueKey?: string;
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

  /**
   * Returns the job's id, or undefined when pg-boss declined to create it. With a unique key
   * the job's id is derived from it, so sending the same work twice queues it once
   * (CODING_STANDARDS §8).
   */
  async send(queue: string, data: object, options: SendOptions = {}): Promise<string | undefined> {
    const id = options.uniqueKey === undefined ? undefined : jobIdFor(queue, options.uniqueKey);
    return (await this.boss.send(queue, data, id === undefined ? {} : { id })) ?? undefined;
  }

  /**
   * Queues a job inside the caller's database transaction, so the job is saved with the
   * change that caused it or not at all (ADR 0008, ADR 0015). The insert runs as the
   * application role, which the records_core migration lets add jobs.
   */
  async sendWithin(transaction: DatabaseTransaction, queue: string, data: object): Promise<void> {
    await this.boss.send(queue, data, {
      db: {
        executeSql: async (text, values = []) => ({
          rows: await transaction.$queryRawUnsafe<unknown[]>(text, ...values),
        }),
      },
    });
  }

  async isCompleted(queue: string, jobId: string): Promise<boolean> {
    const [job] = await this.boss.findJobs(queue, { id: jobId });
    return job?.state === 'completed';
  }

  /**
   * Runs the handler for each job on the queue. Job data comes back from the database, so the
   * handler receives it as `unknown` and parses it (CODING_STANDARDS §4). A handler that
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

/** A UUID-shaped id, the same for the same queue and key, as pg-boss ids must be UUIDs. */
function jobIdFor(queue: string, uniqueKey: string): string {
  const hex = createHash('sha256').update(`${queue}:${uniqueKey}`).digest('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    // Version 8 (custom) and the RFC 4122 variant, so it is a well-formed UUID.
    `8${hex.slice(13, 16)}`,
    `${((Number.parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}
