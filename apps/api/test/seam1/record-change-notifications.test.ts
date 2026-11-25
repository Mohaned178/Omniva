import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OmnivaHarness } from './support/omniva-harness.js';
import {
  RecordChangeProbeModule,
  receivedRecordChanges,
} from './support/record-change-probe.module.js';
import { currentSessionOf, signedInUser } from './support/users.js';
import type { Visitor } from './support/visitor.js';

const DELIVERY_TIMEOUT_MS = 15_000;

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

  it('passes on a change made while the worker was down, once it is back', async () => {
    await omniva.stopWorker();
    const recordId = await createVehicle();
    await omniva.startWorker();

    await expect
      .poll(() => changesTo(recordId), { timeout: DELIVERY_TIMEOUT_MS })
      .toEqual(['created']);
  });
});
