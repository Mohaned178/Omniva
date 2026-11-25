import { Module } from '@nestjs/common';
import { HealthProbeHandler } from './health-probe-handler.js';

/** Worker side of the health check. */
@Module({
  providers: [HealthProbeHandler],
})
export class HealthProbeWorkerModule {}
