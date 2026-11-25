import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { withDatabaseAdmin } from './support/database-admin.js';
import { OmnivaHarness } from './support/omniva-harness.js';
import {
  RecordChangeProbeModule,
  receivedRecordChanges,
} from './support/record-change-probe.module.js';
import { currentSessionOf, signedInUser } from './support/users.js';
import type { Visitor } from './support/visitor.js';

const DELIVERY_TIMEOUT_MS = 15_000;
/** More changes than the worker could pass on in time if it took one per poll. */
const BACKLOG_SIZE = 30;

/** The role the application acts as (the application_database_role migration). */
const APPLICATION_ROLE = 'omniva_app';

/** Runs the work while the application cannot queue jobs, as if the queue had failed. */
async function withJobsRefused<T>(work: () => Promise<T>): Promise<T> {
  await withDatabaseAdmin((admin) =>
    admin.query(`REVOKE INSERT ON ALL TABLES IN SCHEMA pgboss FROM ${APPLICATION_ROLE}`),
  );
  try {
    return await work();
  } finally {
    await withDatabaseAdmin((admin) =>
      admin.query(`GRANT INSERT ON ALL TABLES IN SCHEMA pgboss TO ${APPLICATION_ROLE}`),
    );
  }
}

/**
 * Records are the source of truth (ADR 0008): every change is announced by a durable change
 * notification, saved with the change and passed on by the worker, so whatever derives from
 * records catches up even after a crash.
 */
describe('record change notifications', () => {
  let omniva: OmnivaHarness;
  let me: Visitor;
  let workspaceId: string;

  beforeAll(async () => {
    omniva = await OmnivaHarness.start({ workerModules: [RecordChangeProbeModule] });
    me = await signedInUser(omniva);
    workspaceId = (await currentSessionOf(me)).personalWorkspace.id;
  });
  afterAll(async () => {
    await omniva.stop();
  });

  async function createVehicle(): Promise<string> {
    const { data } = await me.api.POST('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId } },
      body: { typeKey: 'vehicle', title: 'Van', fields: {} },
    });
    if (!data) throw new Error('The vehicle was not created');
    return data.id;
  }

  function changesTo(recordId: string): readonly string[] {
    return receivedRecordChanges
      .filter((notification) => notification.recordId === recordId)
      .map(({ action }) => action);
  }

  it('passes every change to a record on to the modules that react to record changes, once each', async () => {
    const recordId = await createVehicle();
    const path = { workspaceId, recordId };
    await me.api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
      params: { path },
      body: { title: 'Work van' },
    });
    await me.api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/archive', {
      params: { path },
    });

    await expect
      .poll(() => changesTo(recordId), { timeout: DELIVERY_TIMEOUT_MS })
      .toEqual(['created', 'updated', 'archived']);
    expect(receivedRecordChanges.find((change) => change.recordId === recordId)).toEqual({
      workspaceId,
      recordId,
      action: 'created',
      occurredAt: expect.any(String) as string,
    });
  });

  it('saves neither a change nor its history when its notification cannot be queued', async () => {
    const recordId = await createVehicle();
    const path = { workspaceId, recordId };

    const edit = await withJobsRefused(() =>
      me.api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
        params: { path },
        body: { title: 'Never saved' },
      }),
    );
    const shown = await me.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}', {
      params: { path },
    });
    const history = await me.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}/history', {
      params: { path },
    });

    expect(edit.response.status).toBe(500);
    expect(shown.data?.title).toBe('Van');
    expect(history.data?.entries.map(({ action }) => action)).toEqual(['created']);
  });

  it('passes on every change made while the worker was down, promptly once it is back', async () => {
    await omniva.stopWorker();
    const recordIds: string[] = [];
    for (let created = 0; created < BACKLOG_SIZE; created += 1) {
      recordIds.push(await createVehicle());
    }
    await omniva.startWorker();

    await expect
      .poll(() => recordIds.filter((recordId) => changesTo(recordId).length === 0), {
        timeout: DELIVERY_TIMEOUT_MS,
      })
      .toEqual([]);
  });
});
