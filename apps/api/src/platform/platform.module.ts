import { type DynamicModule, Global, Module } from '@nestjs/common';
import { RedisClient } from './cache/redis-client.js';
import { Clock } from './clock/clock.js';
import { SystemClock } from './clock/system-clock.js';
import { AppConfig } from './config/app-config.js';
import { DatabaseClient } from './database/database-client.js';
import { JobQueue } from './jobs/job-queue.js';
import { PROCESS_ROLE, type ProcessRole } from './process-role.js';

export interface PlatformOptions {
  readonly config: AppConfig;
  readonly role: ProcessRole;
}

/** Infrastructure shared by every capability module: config, clock, database, Redis, jobs. */
@Global()
@Module({})
export class PlatformModule {
  static forRoot({ config, role }: PlatformOptions): DynamicModule {
    return {
      module: PlatformModule,
      providers: [
        { provide: AppConfig, useValue: config },
        { provide: PROCESS_ROLE, useValue: role },
        { provide: Clock, useClass: SystemClock },
        DatabaseClient,
        RedisClient,
        JobQueue,
      ],
      exports: [AppConfig, Clock, DatabaseClient, RedisClient, JobQueue],
    };
  }
}
