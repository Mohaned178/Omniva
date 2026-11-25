import type { INestApplication } from '@nestjs/common';
import type { AppConfig } from './platform/config/app-config.js';
import { ApiExceptionFilter } from './platform/http/api-exception-filter.js';

/** REST lives under /v1; changes within a version are additive only (CODING_STANDARDS §9). */
const API_VERSION_PREFIX = 'v1';

/** HTTP set-up shared by the API process, the Seam 1 harness and the OpenAPI generator. */
export function configureApi(app: INestApplication, config: AppConfig): void {
  app.setGlobalPrefix(API_VERSION_PREFIX);
  // The web app is another origin on the same site; it sends the session cookie (spec, D3).
  app.enableCors({ origin: config.webOrigin, credentials: true });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
}
