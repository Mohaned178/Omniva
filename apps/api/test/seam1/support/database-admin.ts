import pg from 'pg';
import { TEST_DATABASE_URL } from './test-environment.js';

/**
 * Runs work on a superuser connection to the test database, for fixtures and catalog checks
 * the application itself can never make: its own connection is subject to row-level security.
 */
export async function withDatabaseAdmin<T>(work: (admin: pg.Client) => Promise<T>): Promise<T> {
  const admin = new pg.Client({ connectionString: TEST_DATABASE_URL });
  await admin.connect();
  try {
    return await work(admin);
  } finally {
    await admin.end();
  }
}
