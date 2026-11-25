import { Module } from '@nestjs/common';
import { HealthCheck } from './health-check.js';
import { HealthController } from './health.controller.js';
import { WorkerProbe } from './worker-probe.js';

/** API side of the health check. */
@Module({
  controllers: [HealthController],
  providers: [HealthCheck, WorkerProbe],
})
export class HealthModule {}
