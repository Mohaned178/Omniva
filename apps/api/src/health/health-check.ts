import { Injectable } from '@nestjs/common';
import type { ComponentStatus, HealthReport } from '@omniva/schemas';
import { RedisClient } from '../platform/cache/redis-client.js';
import { Clock } from '../platform/clock/clock.js';
import { DatabaseClient } from '../platform/database/database-client.js';
import { overallStatus } from './overall-status.js';
import { WorkerProbe } from './worker-probe.js';

/** Checks every component Omniva depends on, at once. */
@Injectable()
export class HealthCheck {
  constructor(
    private readonly database: DatabaseClient,
    private readonly redis: RedisClient,
    private readonly worker: WorkerProbe,
    private readonly clock: Clock,
  ) {}

  async run(): Promise<HealthReport> {
    const [database, redis, worker] = await Promise.all([
      statusOf(this.database.ping()),
      statusOf(this.redis.ping()),
      this.worker.status().catch((): ComponentStatus => 'down'),
    ]);
    const components = { api: 'up', database, redis, worker } as const;
    return {
      status: overallStatus(components),
      checkedAt: this.clock.now().toISOString(),
      components,
    };
  }
}

async function statusOf(ping: Promise<void>): Promise<ComponentStatus> {
  try {
    await ping;
    return 'up';
  } catch {
    return 'down';
  }
}
