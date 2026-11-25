import type { INestApplication } from '@nestjs/common';
import type { AppConfig } from './platform/config/app-config.js';

/** REST lives under /v1; changes within a version are additive only (CODING_STANDARDS §9). */
export const API_VERSION_PREFIX = 'v1';

/** HTTP set-up shared by the API process, the Seam 1 harness and the OpenAPI generator. */
export function configureApi(app: INestApplication, config: AppConfig): void {
  app.setGlobalPrefix(API_VERSION_PREFIX);
  app.enableCors({ origin: config.webOrigin });
  app.enableShutdownHooks();
}
