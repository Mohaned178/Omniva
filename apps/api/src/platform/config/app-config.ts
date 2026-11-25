import { z } from 'zod';

const DEFAULT_API_PORT = 4000;
/** How long the API waits for the worker to finish a probe job before reporting it down. */
const DEFAULT_WORKER_PROBE_TIMEOUT_MS = 3000;
const DEFAULT_MAIL_FROM = 'Omniva <no-reply@omniva.local>';
/** Better Auth signs tokens with this secret; shorter secrets are too easy to guess. */
const MIN_AUTH_SECRET_LENGTH = 32;

const EnvironmentSchema = z.object({
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  WEB_ORIGIN: z.url(),
  /** The address browsers reach the API at. Session cookies are Secure when it is https. */
  API_PUBLIC_URL: z.url(),
  API_PORT: z.coerce.number().int().min(0).max(65_535).default(DEFAULT_API_PORT),
  WORKER_PROBE_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_WORKER_PROBE_TIMEOUT_MS),
  SMTP_URL: z.url(),
  MAIL_FROM: z.string().min(1).default(DEFAULT_MAIL_FROM),
  AUTH_SECRET: z.string().min(MIN_AUTH_SECRET_LENGTH),
  /**
   * The parent domain the web app and the API share, such as `omniva.app`, so the session
   * cookie reaches both subdomains. Unset locally, where both run on localhost.
   */
  COOKIE_DOMAIN: z.string().min(1).optional(),
});

/** Settings read once from the environment at start-up. Also the DI token for them. */
export abstract class AppConfig {
  abstract readonly databaseUrl: string;
  abstract readonly redisUrl: string;
  abstract readonly webOrigin: string;
  abstract readonly apiPublicUrl: string;
  abstract readonly apiPort: number;
  abstract readonly workerProbeTimeoutMs: number;
  abstract readonly smtpUrl: string;
  abstract readonly mailFrom: string;
  abstract readonly authSecret: string;
  abstract readonly cookieDomain: string | undefined;
}

export function loadAppConfig(
  environment: Readonly<Record<string, string | undefined>>,
): AppConfig {
  const parsed = EnvironmentSchema.parse(environment);
  return {
    databaseUrl: parsed.DATABASE_URL,
    redisUrl: parsed.REDIS_URL,
    webOrigin: parsed.WEB_ORIGIN,
    apiPublicUrl: parsed.API_PUBLIC_URL,
    apiPort: parsed.API_PORT,
    workerProbeTimeoutMs: parsed.WORKER_PROBE_TIMEOUT_MS,
    smtpUrl: parsed.SMTP_URL,
    mailFrom: parsed.MAIL_FROM,
    authSecret: parsed.AUTH_SECRET,
    cookieDomain: parsed.COOKIE_DOMAIN,
  };
}
