import { Injectable } from '@nestjs/common';
import type { ComponentStatus, HealthReport } from '@omniva/schemas';
import { RedisClient } from '../platform/cache/redis-client.js';
import { Clock } from '../platform/clock/clock.js';
import { DatabaseClient } from '../platform/database/database-client.js';
import { overallStatus } from './overall-status.js';
import { WorkerProbe } from './worker-probe.js';

const REDIS_PING_TIMEOUT_MS = 1000;

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
      this.databaseStatus(),
      this.redisStatus(),
      this.worker.status().catch((): ComponentStatus => 'down'),
    ]);
    const components = { api: 'up', database, redis, worker } as const;
    return {
      status: overallStatus(components),
      checkedAt: this.clock.now().toISOString(),
      components,
    };
  }

  private async databaseStatus(): Promise<ComponentStatus> {
    try {
      await this.database.$queryRaw`SELECT 1`;
      return 'up';
    } catch {
      return 'down';
    }
  }

  private async redisStatus(): Promise<ComponentStatus> {
    try {
      await Promise.race([this.redis.connection.ping(), rejectAfter(REDIS_PING_TIMEOUT_MS)]);
      return 'up';
    } catch {
      return 'down';
    }
  }
}

function rejectAfter(milliseconds: number): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`timed out after ${String(milliseconds)} ms`));
    }, milliseconds).unref();
  });
}
