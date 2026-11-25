import { z } from 'zod';

const DEFAULT_API_PORT = 4000;
/** How long the API waits for the worker to finish a probe job before reporting it down. */
const DEFAULT_WORKER_PROBE_TIMEOUT_MS = 3000;

const EnvironmentSchema = z.object({
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  WEB_ORIGIN: z.url(),
  API_PORT: z.coerce.number().int().min(0).max(65_535).default(DEFAULT_API_PORT),
  WORKER_PROBE_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_WORKER_PROBE_TIMEOUT_MS),
});

/** Settings read once from the environment at start-up. Also the DI token for them. */
export abstract class AppConfig {
  abstract readonly databaseUrl: string;
  abstract readonly redisUrl: string;
  abstract readonly webOrigin: string;
  abstract readonly apiPort: number;
  abstract readonly workerProbeTimeoutMs: number;
}

export function loadAppConfig(
  environment: Readonly<Record<string, string | undefined>>,
): AppConfig {
  const parsed = EnvironmentSchema.parse(environment);
  return {
    databaseUrl: parsed.DATABASE_URL,
    redisUrl: parsed.REDIS_URL,
    webOrigin: parsed.WEB_ORIGIN,
    apiPort: parsed.API_PORT,
    workerProbeTimeoutMs: parsed.WORKER_PROBE_TIMEOUT_MS,
  };
}
