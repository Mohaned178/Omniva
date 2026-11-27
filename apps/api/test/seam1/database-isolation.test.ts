import type { CurrentSession } from '@omniva/schemas';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { DatabaseClient } from '../../src/platform/database/database-client.js';
import type { ScopedDatabase } from '../../src/platform/database/scoped-database.js';
import { withDatabaseAdmin } from './support/database-admin.js';
import { OmnivaHarness } from './support/omniva-harness.js';
import { currentSessionOf, signedInUser } from './support/users.js';
import type { Visitor } from './support/visitor.js';

/** Gives the user a car whose registration reminder is scheduled. */
async function carWithAReminder(omniva: OmnivaHarness, user: Visitor): Promise<string> {
  const { personalWorkspace } = await currentSessionOf(user);
  const { data } = await user.api.POST('/v1/workspaces/{workspaceId}/records', {
    params: { path: { workspaceId: personalWorkspace.id } },
    body: { typeKey: 'vehicle', title: 'Car', fields: { registrationExpiresOn: '2027-09-30' } },
  });
  if (!data) throw new Error('The car was not created');
  await omniva.recordChangesPassedOn();
  return data.id;
}

/**
 * The second isolation layer on its own (ADR 0009, ADR 0018): the application's own database
 * connection is used directly, with no gate and no workspace filter in any query, and
 * PostgreSQL itself must refuse every row of another workspace.
 */
describe('PostgreSQL row-level security, with the application gate bypassed', () => {
  let omniva: OmnivaHarness;
  let scoped: ScopedDatabase;
  let unscoped: DatabaseClient;
  let myUserId: string;
  let mine: CurrentSession['personalWorkspace'];
  let theirs: CurrentSession['personalWorkspace'];
  let myCarId: string;
  let theirCarId: string;

  beforeAll(async () => {
    omniva = await OmnivaHarness.start();
    scoped = omniva.scopedDatabase();
    unscoped = omniva.unscopedDatabase();
    const [me, them] = await Promise.all([signedInUser(omniva), signedInUser(omniva)]);
    ({
      user: { id: myUserId },
      personalWorkspace: mine,
    } = await currentSessionOf(me));
    ({ personalWorkspace: theirs } = await currentSessionOf(them));
    [myCarId, theirCarId] = await Promise.all([
      carWithAReminder(omniva, me),
      carWithAReminder(omniva, them),
    ]);
  });

  it('shows a transaction acting for a user only their own memberships and personal workspace, and no records', async () => {
    const visible = await scoped.$scopedTransaction({ userId: myUserId }, async (tx) => ({
      members: await tx.member.findMany({
        where: { workspaceId: { in: [mine.id, theirs.id] } },
        select: { workspaceId: true },
      }),
      workspaces: await tx.workspace.findMany({
        where: { id: { in: [mine.id, theirs.id] } },
        select: { id: true },
      }),
      records: await tx.record.count({
        where: { id: { in: [mine.mePersonId, theirs.mePersonId] } },
      }),
    }));

    expect(visible).toEqual({
      members: [{ workspaceId: mine.id }],
      workspaces: [{ id: mine.id }],
      records: 0,
    });
  });

  it('refuses a transaction that acts for a user inside a workspace they are not a member of', async () => {
    const attempt = scoped.$scopedTransaction({ workspaceId: theirs.id, userId: myUserId }, (tx) =>
      tx.record.count(),
    );

    await expect(attempt).rejects.toThrow(/not a member/);
  });
  afterAll(async () => {
    await omniva.stop();
  });

  it('shows a transaction scoped to one workspace only that workspace’s rows, even when asked for another’s by id', async () => {
    const visible = await scoped.$scopedTransaction({ workspaceId: mine.id }, async (tx) => ({
      records: await tx.record.findMany({
        where: { id: { in: [mine.mePersonId, theirs.mePersonId] } },
        select: { id: true },
      }),
      members: await tx.member.findMany({
        where: { workspaceId: { in: [mine.id, theirs.id] } },
        select: { workspaceId: true },
      }),
      workspaces: await tx.workspace.findMany({
        where: { id: { in: [mine.id, theirs.id] } },
        select: { id: true },
      }),
    }));

    expect(visible).toEqual({
      records: [{ id: mine.mePersonId }],
      members: [{ workspaceId: mine.id }],
      workspaces: [{ id: mine.id }],
    });
  });

  it('refuses to write a record into another workspace', async () => {
    const intrusion = scoped.$scopedTransaction({ workspaceId: mine.id }, (tx) =>
      tx.record.create({
        data: {
          workspaceId: theirs.id,
          block: 'note',
          typeKey: 'note',
          homeModule: 'productivity',
          title: 'Planted',
        },
      }),
    );

    await expect(intrusion).rejects.toThrow(/row-level security/);
  });

  it('changes and deletes nothing in another workspace', async () => {
    const counts = await scoped.$scopedTransaction({ workspaceId: mine.id }, async (tx) => ({
      updated: (
        await tx.record.updateMany({ where: { id: theirs.mePersonId }, data: { title: 'X' } })
      ).count,
      deleted: (await tx.member.deleteMany({ where: { workspaceId: theirs.id } })).count,
    }));
    const theirMe = await scoped.$scopedTransaction({ workspaceId: theirs.id }, (tx) =>
      tx.record.findUnique({ where: { id: theirs.mePersonId }, select: { title: true } }),
    );

    expect(counts).toEqual({ updated: 0, deleted: 0 });
    expect(theirMe).toEqual({ title: 'Me' });
  });

  it('shows nothing to a query that names no workspace', async () => {
    const [records, members, workspaces] = await Promise.all([
      unscoped.record.count(),
      unscoped.member.count(),
      unscoped.workspace.count(),
    ]);

    expect({ records, members, workspaces }).toEqual({ records: 0, members: 0, workspaces: 0 });
  });

  it('lets Omniva’s check for due reminders see the due notices of every workspace, and nothing else (ADR 0021)', async () => {
    const records = [myCarId, theirCarId];
    const visible = await scoped.$scopedTransaction({ task: 'reminders.find-due' }, async (tx) => ({
      notices: (
        await tx.reminderNotice.findMany({
          where: { recordId: { in: records } },
          distinct: ['workspaceId'],
          select: { workspaceId: true },
          orderBy: { workspaceId: 'asc' },
        })
      ).map(({ workspaceId }) => workspaceId),
      records: await tx.record.count({ where: { id: { in: records } } }),
      keyDates: await tx.keyDate.count({ where: { recordId: { in: records } } }),
      deliveries: await tx.reminderDelivery.count(),
      handlings: await tx.reminderHandling.count(),
      members: await tx.member.count(),
      workspaces: await tx.workspace.count(),
      activity: await tx.activityEntry.count(),
    }));

    expect(visible).toEqual({
      notices: [mine.id, theirs.id].sort(),
      records: 0,
      keyDates: 0,
      deliveries: 0,
      handlings: 0,
      members: 0,
      workspaces: 0,
      activity: 0,
    });
  });

  it('lets Omniva’s check for due reminders change nothing', async () => {
    const changed = await scoped.$scopedTransaction({ task: 'reminders.find-due' }, async (tx) => ({
      updated: (
        await tx.reminderNotice.updateMany({
          where: { recordId: myCarId },
          data: { daysBefore: 1 },
        })
      ).count,
      deleted: (await tx.reminderNotice.deleteMany({ where: { recordId: theirCarId } })).count,
    }));
    const planting = scoped.$scopedTransaction({ task: 'reminders.find-due' }, (tx) =>
      tx.reminderNotice.create({
        data: {
          workspaceId: theirs.id,
          recordId: theirCarId,
          fieldKey: 'registrationExpiresOn',
          occursOn: new Date('2030-01-01'),
          daysBefore: 1,
          remindOn: new Date('2029-12-31'),
          lapsesOn: new Date('2030-01-01'),
        },
      }),
    );

    expect(changed).toEqual({ updated: 0, deleted: 0 });
    await expect(planting).rejects.toThrow(/row-level security/);
  });

  it('refuses to run a scoped transaction on a connection that could bypass row-level security', async () => {
    const applicationRole = await scoped.$scopedTransaction({}, async (tx) => {
      const [row] = await tx.$queryRaw<{ role: string }[]>`SELECT current_user AS role`;
      return row?.role ?? '';
    });

    await withDatabaseAdmin(async (admin) => {
      await admin.query(`ALTER ROLE ${admin.escapeIdentifier(applicationRole)} BYPASSRLS`);
      try {
        const attempt = scoped.$scopedTransaction({ workspaceId: mine.id }, (tx) =>
          tx.record.count(),
        );
        await expect(attempt).rejects.toThrow(/row-level security/);
      } finally {
        await admin.query(`ALTER ROLE ${admin.escapeIdentifier(applicationRole)} NOBYPASSRLS`);
      }
    });
  });

  it('protects every workspace-owned table with forced row-level security and a policy', async () => {
    const tables = await withDatabaseAdmin(async (admin) => {
      const { rows } = await admin.query<{
        table: string;
        isEnabled: boolean;
        isForced: boolean;
        policies: number;
      }>(`
        SELECT c.relname AS "table",
               c.relrowsecurity AS "isEnabled",
               c.relforcerowsecurity AS "isForced",
               (SELECT count(*)::int FROM pg_policy p WHERE p.polrelid = c.oid) AS "policies"
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r'
          AND (c.relname = 'workspace' OR EXISTS (
            SELECT 1 FROM pg_attribute a
            WHERE a.attrelid = c.oid AND a.attname = 'workspace_id' AND NOT a.attisdropped))
        ORDER BY c.relname`);
      return rows;
    });

    expect(tables.map(({ table }) => table)).toEqual(
      expect.arrayContaining([
        'activity_entry',
        'key_date',
        'member',
        'record',
        'reminder_delivery',
        'reminder_handling',
        'reminder_notice',
        'workspace',
      ]),
    );
    expect(
      tables.filter(
        ({ isEnabled, isForced, policies }) => !isEnabled || !isForced || policies === 0,
      ),
    ).toEqual([]);
  });
});
