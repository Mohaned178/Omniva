import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OmnivaHarness } from './support/omniva-harness.js';
import { currentSessionOf, signedInUser } from './support/users.js';
import type { Visitor } from './support/visitor.js';

const FAMILY_CAR = {
  typeKey: 'vehicle',
  title: 'Family car',
  fields: { make: 'Toyota', model: 'Corolla', year: 2019, registrationNumber: 'AB-123-C' },
} as const;

const ONE_HOUR = 60 * 60 * 1000;

/** Records core, traced through its first built-in Type: a Vehicle (spec C28–C30, C34–C35). */
describe('a Vehicle record', () => {
  let omniva: OmnivaHarness;
  let me: Visitor;
  let workspaceId: string;

  beforeAll(async () => {
    omniva = await OmnivaHarness.start();
    me = await signedInUser(omniva);
    workspaceId = (await currentSessionOf(me)).personalWorkspace.id;
  });
  afterAll(async () => {
    await omniva.stop();
  });

  async function createFamilyCar(): Promise<string> {
    const { data } = await me.api.POST('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId } },
      body: FAMILY_CAR,
    });
    if (!data) throw new Error('The family car was not created');
    return data.id;
  }

  async function assetIds(archived: boolean): Promise<readonly string[]> {
    const { data } = await me.api.GET('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId }, query: { module: 'assets', archived } },
    });
    return data?.records.map(({ id }) => id) ?? [];
  }

  it('lives in Assets & Possessions as soon as it is created, owned and not archived', async () => {
    const created = await me.api.POST('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId } },
      body: FAMILY_CAR,
    });
    const assets = await me.api.GET('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId }, query: { module: 'assets' } },
    });

    expect(created.response.status).toBe(201);
    expect(created.data).toMatchObject({
      ...FAMILY_CAR,
      homeModule: 'assets',
      lifecycleState: 'owned',
      isArchived: false,
    });
    expect(assets.data?.records.map(({ id }) => id)).toContain(created.data?.id);
  });

  it.each([
    ['a field the Type does not have', { colour: 'red' }],
    ['a field holding the wrong kind of value', { year: 'nineteen' }],
    ['a date that is not a calendar date', { purchasedOn: '2019-02-30' }],
  ])('refuses %s, and creates nothing', async (_case, fields) => {
    const title = `Refused ${crypto.randomUUID()}`;
    const attempt = await me.api.POST('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId } },
      body: { typeKey: 'vehicle', title, fields },
    });
    const assets = await me.api.GET('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId }, query: { module: 'assets' } },
    });

    expect(attempt.response.status).toBe(400);
    expect(attempt.error?.code).toBe('INVALID_INPUT');
    expect(assets.data?.records.map((record) => record.title)).not.toContain(title);
  });

  it('shows a record by itself, and keeps an edit to its title and fields, clearing a field left out', async () => {
    const recordId = await createFamilyCar();

    const edit = await me.api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
      params: { path: { workspaceId, recordId } },
      body: { title: 'Old faithful', fields: { make: 'Toyota', model: 'Yaris' } },
    });
    const shown = await me.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}', {
      params: { path: { workspaceId, recordId } },
    });

    expect(edit.response.status).toBe(200);
    expect(shown.data).toMatchObject({
      id: recordId,
      title: 'Old faithful',
      fields: { make: 'Toyota', model: 'Yaris' },
    });
    expect(shown.data?.fields).not.toHaveProperty('year');
  });

  it('refuses an edit whose fields the Type does not allow, and keeps the record as it was', async () => {
    const recordId = await createFamilyCar();

    const edit = await me.api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
      params: { path: { workspaceId, recordId } },
      body: { fields: { wheels: 4 } },
    });
    const shown = await me.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}', {
      params: { path: { workspaceId, recordId } },
    });

    expect(edit.response.status).toBe(400);
    expect(shown.data?.fields).toEqual(FAMILY_CAR.fields);
  });

  it('puts an archived record away from its module, keeping it whole and findable, until it is unarchived', async () => {
    const recordId = await createFamilyCar();
    const inUse = () => assetIds(false);
    const archived = () => assetIds(true);

    const archive = await me.api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/archive', {
      params: { path: { workspaceId, recordId } },
    });
    const whileArchived = { inUse: await inUse(), archived: await archived() };
    const shown = await me.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}', {
      params: { path: { workspaceId, recordId } },
    });
    const unarchive = await me.api.POST(
      '/v1/workspaces/{workspaceId}/records/{recordId}/unarchive',
      { params: { path: { workspaceId, recordId } } },
    );

    expect(archive.data?.isArchived).toBe(true);
    expect(whileArchived.inUse).not.toContain(recordId);
    expect(whileArchived.archived).toContain(recordId);
    expect(shown.data).toMatchObject({ isArchived: true, lifecycleState: 'owned', ...FAMILY_CAR });
    expect(unarchive.data?.isArchived).toBe(false);
    expect(await inUse()).toContain(recordId);
  });

  it('keeps the history of every change to a record, who made it and when', async () => {
    const { user } = await currentSessionOf(me);
    const path = { workspaceId, recordId: await createFamilyCar() };
    const createdAt = omniva.clock.now();
    omniva.clock.advanceBy(ONE_HOUR);
    await me.api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
      params: { path },
      body: { title: 'Old faithful' },
    });
    omniva.clock.advanceBy(ONE_HOUR);
    await me.api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/archive', {
      params: { path },
    });
    // Archiving it again changes nothing, so nothing more is recorded.
    await me.api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/archive', {
      params: { path },
    });

    const { data } = await me.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}/history', {
      params: { path },
    });

    const at = (hoursLater: number) =>
      new Date(createdAt.getTime() + hoursLater * ONE_HOUR).toISOString();
    expect(data?.entries).toEqual([
      { action: 'created', actorUserId: user.id, occurredAt: at(0) },
      { action: 'updated', actorUserId: user.id, occurredAt: at(1) },
      { action: 'archived', actorUserId: user.id, occurredAt: at(2) },
    ]);
  });

  it('records that Omniva, not the user, created their Me', async () => {
    const newcomer = await signedInUser(omniva);
    const { personalWorkspace } = await currentSessionOf(newcomer);

    const { data } = await newcomer.api.GET(
      '/v1/workspaces/{workspaceId}/records/{recordId}/history',
      {
        params: {
          path: { workspaceId: personalWorkspace.id, recordId: personalWorkspace.mePersonId },
        },
      },
    );

    expect(data?.entries).toEqual([
      { action: 'created', actorUserId: null, occurredAt: expect.any(String) as string },
    ]);
  });

  it('finds no record by an id that exists nowhere', async () => {
    const shown = await me.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}', {
      params: { path: { workspaceId, recordId: crypto.randomUUID() } },
    });

    expect(shown.response.status).toBe(404);
    expect(shown.error?.code).toBe('RECORD_NOT_FOUND');
  });

  it('offers Vehicle as a built-in Type with its fields, Key dates, default reminders and home', async () => {
    const { data } = await me.api.GET('/v1/workspaces/{workspaceId}/types', {
      params: { path: { workspaceId } },
    });

    expect(data?.types).toContainEqual({
      key: 'vehicle',
      block: 'item',
      homeModule: 'assets',
      fields: [
        { key: 'make', kind: 'text' },
        { key: 'model', kind: 'text' },
        { key: 'year', kind: 'number' },
        { key: 'registrationNumber', kind: 'text' },
        { key: 'purchasedOn', kind: 'date' },
        { key: 'registrationExpiresOn', kind: 'date' },
        { key: 'inspectionDueOn', kind: 'date' },
      ],
      keyDateFields: ['registrationExpiresOn', 'inspectionDueOn'],
      defaultReminderRules: [
        { keyDateField: 'registrationExpiresOn', daysBefore: 30 },
        { keyDateField: 'inspectionDueOn', daysBefore: 30 },
      ],
    });
  });

  it('refuses a record of a Type that does not exist', async () => {
    const attempt = await me.api.POST('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId } },
      body: { typeKey: 'spaceship', title: 'Rocket', fields: {} },
    });

    expect(attempt.response.status).toBe(400);
    expect(attempt.error?.code).toBe('UNKNOWN_TYPE');
  });
});
