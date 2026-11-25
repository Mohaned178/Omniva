import { defineConfig, devices } from '@playwright/test';

// Ports apart from local development (web 3000, API 4000), so tests and a dev server can run
// side by side.
const WEB_PORT = '3100';
const API_PORT = '4100';
const WEB_ORIGIN = `http://localhost:${WEB_PORT}`;
const API_URL = `http://localhost:${API_PORT}`;

/**
 * Seam 3: browser journeys against the production build of the web app, talking to the real
 * API and worker on the local services (PostgreSQL, Redis, Mailpit).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: WEB_ORIGIN, trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'pnpm --filter @omniva/api serve',
      url: `${API_URL}/v1/health`,
      env: { API_PORT, API_PUBLIC_URL: API_URL, WEB_ORIGIN },
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      // The API address is fixed into the build, so the web app is built for these ports.
      command: `pnpm exec next build && pnpm exec next start --port ${WEB_PORT}`,
      url: WEB_ORIGIN,
      env: { NEXT_PUBLIC_API_URL: API_URL },
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'], browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
