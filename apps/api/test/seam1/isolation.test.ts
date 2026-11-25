import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WORKSPACE_ID_PARAM } from '../../src/identity/requires-role.decorator.js';
import { ISOLATION_CASES, type Victim } from './isolation/isolation-cases.js';
import { apiOperations, type ApiOperation } from './support/api-operations.js';
import { OmnivaHarness } from './support/omniva-harness.js';
import { currentSessionOf, signedInUser } from './support/users.js';

const WORKSPACE_PLACEHOLDER = `{${WORKSPACE_ID_PARAM}}`;

/**
 * The isolation suite (ADR 0018): every endpoint is called by a user from another workspace,
 * aimed at a victim's data, and must give away nothing of the victim's and change nothing.
 * Zero cross-account data exposure is a hard gate (spec, M8).
 */
describe('isolation between workspaces', () => {
  let omniva: OmnivaHarness;
  let operations: readonly ApiOperation[];
  beforeAll(async () => {
    omniva = await OmnivaHarness.start();
    operations = apiOperations(omniva.openApiDocument());
  });
  afterAll(async () => {
    await omniva.stop();
  });

  it('has an isolation test for every endpoint, and none for an endpoint that is gone', () => {
    const endpoints = operations.map(({ operationId }) => operationId).sort();

    expect(Object.keys(ISOLATION_CASES).sort()).toEqual(endpoints);
  });

  it('puts every endpoint that names a workspace behind the workspace gate', () => {
    const ungated = operations.filter(
      ({ path, minimumRole }) =>
        path.includes(WORKSPACE_PLACEHOLDER) !== (minimumRole !== undefined),
    );

    expect(ungated).toEqual([]);
  });

  it.each(Object.keys(ISOLATION_CASES))(
    'gives a user from another workspace nothing of the victim’s at %s',
    async (operationId) => {
      const operation = operations.find((candidate) => candidate.operationId === operationId);
      const isolationCase = ISOLATION_CASES[operationId];
      if (!operation || !isolationCase) throw new Error(`No endpoint is called ${operationId}`);
      const [victim, intruder] = await Promise.all([newVictim(omniva), signedInUser(omniva)]);
      const target = await isolationCase(victim);
      const secrets = [...secretsOf(victim), ...(target.secrets ?? [])];

      const aimedAtVictim = await intruder.raw(operation.method, operation.path, target);
      const bodies = [await aimedAtVictim.text()];
      if (operation.minimumRole !== undefined) {
        expect(aimedAtVictim.status).toBe(404);
        // The same call through the intruder's own workspace must not reach the victim's data
        // its other parameters name.
        const { personalWorkspace } = await currentSessionOf(intruder);
        const throughOwnWorkspace = await intruder.raw(operation.method, operation.path, {
          ...target,
          params: { ...target.params, [WORKSPACE_ID_PARAM]: personalWorkspace.id },
        });
        bodies.push(await throughOwnWorkspace.text());
      }

      expect(bodies.flatMap((body) => secrets.filter((secret) => body.includes(secret)))).toEqual(
        [],
      );
      await target.expectUnharmed?.();
    },
  );
});

async function newVictim(omniva: OmnivaHarness): Promise<Victim> {
  const user = await signedInUser(omniva);
  return { user, session: await currentSessionOf(user) };
}

/** Identifies the victim; no response to anyone else may contain any of it. */
function secretsOf({ session }: Victim): readonly string[] {
  return [
    session.user.id,
    session.user.email,
    session.personalWorkspace.id,
    session.personalWorkspace.mePersonId,
  ];
}
