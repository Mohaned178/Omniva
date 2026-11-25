import { type DynamicModule, Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import type { AppConfig } from './platform/config/app-config.js';
import { PlatformModule } from './platform/platform.module.js';

/** The HTTP API process. */
@Module({})
export class ApiModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: ApiModule,
      imports: [PlatformModule.forRoot({ config, role: 'api' }), HealthModule],
    };
  }
}
