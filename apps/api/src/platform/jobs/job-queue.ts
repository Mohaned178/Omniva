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

/**
 * Durable background jobs stored in PostgreSQL with pg-boss (ADR 0015). Only the worker runs
 * pg-boss maintenance and cron scheduling; API instances just send jobs.
 */
@Injectable()
export class JobQueue implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobQueue.name);
  readonly boss: PgBoss;

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
}
