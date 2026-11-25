import { type DynamicModule, Module } from '@nestjs/common';
import { HealthProbeWorkerModule } from './health/health-probe-worker.module.js';
import { IdentityWorkerModule } from './identity/identity-worker.module.js';
import type { AppConfig } from './platform/config/app-config.js';
import { PlatformModule } from './platform/platform.module.js';

/** The worker process: the same codebase, running background jobs (ADR 0006, ADR 0015). */
@Module({})
export class WorkerModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: WorkerModule,
      imports: [
        PlatformModule.forRoot({ config, role: 'worker' }),
        HealthProbeWorkerModule,
        IdentityWorkerModule,
      ],
    };
  }
}
