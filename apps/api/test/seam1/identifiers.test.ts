import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { withDatabaseAdmin } from './support/database-admin.js';
import { OmnivaHarness } from './support/omniva-harness.js';
import { currentSessionOf, signedInUser } from './support/users.js';

/** A version-4 UUID: 122 random bits. */
const RANDOM_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
/** Better Auth's identifiers: 32 characters drawn at random from 62, about 190 bits. */
const RANDOM_STRING = /^[A-Za-z0-9]{32}$/;

/** Identifiers are random and non-guessable everywhere (spec, D4; CODING_STANDARDS §6). */
describe('identifiers', () => {
  let omniva: OmnivaHarness;
  beforeAll(async () => {
    omniva = await OmnivaHarness.start();
  });
  afterAll(async () => {
    await omniva.stop();
  });

  it('gives every user, workspace and Me record a random identifier that cannot be guessed', async () => {
    const sessions = await Promise.all(
      [1, 2].map(async () => currentSessionOf(await signedInUser(omniva))),
    );
    const ids = sessions.flatMap(({ user, personalWorkspace }) => [
      user.id,
      personalWorkspace.id,
      personalWorkspace.mePersonId,
    ]);

    for (const { user, personalWorkspace } of sessions) {
      expect(user.id).toMatch(RANDOM_STRING);
      expect(personalWorkspace.id).toMatch(RANDOM_UUID);
      expect(personalWorkspace.mePersonId).toMatch(RANDOM_UUID);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('numbers no row from a sequence, whose next value anyone could guess', async () => {
    const counted = await withDatabaseAdmin(async (admin) => {
      const { rows } = await admin.query<{ table: string; column: string }>(`
        SELECT table_name AS "table", column_name AS "column"
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND (column_default LIKE 'nextval(%' OR is_identity = 'YES')`);
      return rows;
    });

    expect(counted).toEqual([]);
  });
});
