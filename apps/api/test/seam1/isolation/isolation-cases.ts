import { randomUUID } from 'node:crypto';
import type { CurrentSession } from '@omniva/schemas';
import { expect } from 'vitest';
import type { RawRequest, Visitor } from '../support/visitor.js';

/** The user whose data an intruder from another workspace tries to reach. */
export interface Victim {
  readonly user: Visitor;
  readonly session: CurrentSession;
}

/** How the intruder aims one endpoint at the victim's data. */
interface Target extends RawRequest {
  /** What of the victim's, beyond their ids and email address, must never reach the intruder. */
  readonly secrets?: readonly string[];
  /** Fails when the intruder's call changed anything of the victim's. */
  readonly expectUnharmed?: () => Promise<void>;
}

/** Gives the victim whatever data the endpoint could reach, and says how to aim at it. */
type IsolationCase = (victim: Victim) => Promise<Target>;

const INTRUDERS_PASSWORD = 'an intruder chose this password';

/** The victim's session survived: they are still signed in as themselves. */
const stillSignedIn =
  ({ user, session }: Victim) =>
  async (): Promise<void> => {
    const { data } = await user.api.GET('/v1/session');
    expect(data?.user.id).toBe(session.user.id);
  };

interface VictimsVehicle {
  readonly params: { readonly workspaceId: string; readonly recordId: string };
  /** Its content, which no response to anyone else may contain. */
  readonly secrets: readonly string[];
  /** Fails when the vehicle, or its history, is not exactly as the victim left it. */
  readonly expectUnharmed: () => Promise<void>;
}

/** Gives the victim a vehicle whose title and fields only they know. */
async function vehicleOf({ user, session }: Victim): Promise<VictimsVehicle> {
  const workspaceId = session.personalWorkspace.id;
  const title = `Victim's car ${randomUUID()}`;
  const registrationNumber = randomUUID();
  const { data: vehicle } = await user.api.POST('/v1/workspaces/{workspaceId}/records', {
    params: { path: { workspaceId } },
    body: { typeKey: 'vehicle', title, fields: { registrationNumber } },
  });
  if (!vehicle) throw new Error('The victim’s vehicle was not created');
  const params = { workspaceId, recordId: vehicle.id };
  const historyBefore = await historyOf(user, params);

  return {
    params,
    secrets: [title, registrationNumber],
    expectUnharmed: async () => {
      const { data } = await user.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}', {
        params: { path: params },
      });
      expect(data).toEqual(vehicle);
      expect(await historyOf(user, params)).toEqual(historyBefore);
    },
  };
}

async function historyOf(user: Visitor, path: VictimsVehicle['params']): Promise<unknown> {
  const { data } = await user.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}/history', {
    params: { path },
  });
  return data;
}

/** Aims an endpoint that names one record at the victim's vehicle. */
const atVictimsVehicle =
  (body?: unknown): IsolationCase =>
  async (victim) => {
    const { params, secrets, expectUnharmed } = await vehicleOf(victim);
    return { params, secrets, expectUnharmed, ...(body !== undefined && { body }) };
  };

/**
 * The isolation test of every API endpoint, by operationId (ADR 0018). The isolation suite
 * fails while any endpoint lacks one, so a new endpoint cannot ship without it. Each case
 * aims the endpoint at the victim's data as precisely as an intruder could.
 */
export const ISOLATION_CASES: Readonly<Record<string, IsolationCase>> = {
  getHealth: () => Promise.resolve({}),

  // Signing up with the victim's address must neither reveal them nor touch their account.
  signUp: (victim) =>
    Promise.resolve({
      body: { email: victim.session.user.email, password: INTRUDERS_PASSWORD },
      expectUnharmed: stillSignedIn(victim),
    }),

  verifyEmail: (victim) =>
    Promise.resolve({ body: { token: randomUUID() }, expectUnharmed: stillSignedIn(victim) }),

  signIn: (victim) =>
    Promise.resolve({
      body: { email: victim.session.user.email, password: INTRUDERS_PASSWORD },
      expectUnharmed: stillSignedIn(victim),
    }),

  // Signing out ends only the caller's own session.
  signOut: (victim) => Promise.resolve({ expectUnharmed: stillSignedIn(victim) }),

  getCurrentSession: () => Promise.resolve({}),

  getWorkspace: ({ session }) =>
    Promise.resolve({ params: { workspaceId: session.personalWorkspace.id } }),

  listTypes: ({ session }) =>
    Promise.resolve({ params: { workspaceId: session.personalWorkspace.id } }),

  // Planting a record in the victim's workspace must fail and leave their records as they were.
  createRecord: async (victim) => {
    const { params, secrets, expectUnharmed } = await vehicleOf(victim);
    const listAssets = async () =>
      (
        await victim.user.api.GET('/v1/workspaces/{workspaceId}/records', {
          params: { path: { workspaceId: params.workspaceId }, query: { module: 'assets' } },
        })
      ).data;
    const assetsBefore = await listAssets();
    return {
      params,
      secrets,
      body: { typeKey: 'vehicle', title: 'Planted', fields: {} },
      expectUnharmed: async () => {
        await expectUnharmed();
        expect(await listAssets()).toEqual(assetsBefore);
      },
    };
  },

  listRecords: async (victim) => {
    const { params, secrets } = await vehicleOf(victim);
    return { params, secrets, query: { module: 'assets' } };
  },

  getRecord: atVictimsVehicle(),
  getRecordHistory: atVictimsVehicle(),
  updateRecord: atVictimsVehicle({ title: 'Renamed by an intruder' }),
  archiveRecord: atVictimsVehicle(),
  unarchiveRecord: atVictimsVehicle(),
};
