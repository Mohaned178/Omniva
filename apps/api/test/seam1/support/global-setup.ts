import { execFileSync } from 'node:child_process';
import pg from 'pg';
import { TEST_DATABASE_URL } from './test-environment.js';

/** Creates the test database if needed and applies every migration, as a deploy would. */
export default async function setup(): Promise<void> {
  await createDatabaseIfMissing(TEST_DATABASE_URL);
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

async function createDatabaseIfMissing(databaseUrl: string): Promise<void> {
  const databaseName = new URL(databaseUrl).pathname.slice(1);
  const maintenanceUrl = new URL(databaseUrl);
  maintenanceUrl.pathname = '/postgres';

  const client = new pg.Client({ connectionString: maintenanceUrl.toString() });
  await client.connect();
  try {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      databaseName,
    ]);
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE ${client.escapeIdentifier(databaseName)}`);
    }
  } finally {
    await client.end();
  }
}
