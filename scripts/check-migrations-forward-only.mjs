// Fails when a change edits, renames or deletes a migration that already exists on main.
// Migrations are forward-only (CODING_STANDARDS §6): fixing one means adding a new one.
import { execFileSync } from 'node:child_process';

const MIGRATIONS_DIR = 'apps/api/prisma/migrations';
const baseRef = process.env.MIGRATIONS_BASE_REF ?? 'origin/main';

const changed = execFileSync(
  'git',
  ['diff', '--name-status', '--diff-filter=DMR', `${baseRef}...HEAD`, '--', MIGRATIONS_DIR],
  { encoding: 'utf8' },
).trim();

if (changed !== '') {
  console.error(`Existing migrations were changed. Add a new migration instead:\n${changed}`);
  process.exit(1);
}
console.log(`Migrations are forward-only relative to ${baseRef}.`);
