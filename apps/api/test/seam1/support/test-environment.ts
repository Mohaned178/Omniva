import { loadAppConfig, type AppConfig } from '../../../src/platform/config/app-config.js';

/** Matches docker-compose.yml locally and the service containers in CI. */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://omniva:omniva@localhost:55432/omniva_test';
const TEST_REDIS_URL = process.env.TEST_REDIS_URL ?? 'redis://localhost:56379/1';
export const MAILPIT_API_URL = process.env.TEST_MAILPIT_API_URL ?? 'http://localhost:58025';
const TEST_SMTP_URL = process.env.TEST_SMTP_URL ?? 'smtp://localhost:51025';
export const TEST_WEB_ORIGIN = 'http://localhost:3000';

// The worker probe keeps its production timeout: a shorter one made "worker up" flaky on a
// busy machine, and a test that waits out the timeout is rare.
export function testConfig(overrides: Readonly<Record<string, string>> = {}): AppConfig {
  return loadAppConfig({
    DATABASE_URL: TEST_DATABASE_URL,
    REDIS_URL: TEST_REDIS_URL,
    WEB_ORIGIN: TEST_WEB_ORIGIN,
    // An https address, as in every deployed environment, so session cookies are Secure.
    API_PUBLIC_URL: 'https://api.omniva.test',
    API_PORT: '0',
    SMTP_URL: TEST_SMTP_URL,
    AUTH_SECRET: 'seam1-test-secret-not-used-anywhere-else-0123456789',
    ...overrides,
  });
}
