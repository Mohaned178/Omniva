import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { withDatabaseAdmin } from './support/database-admin.js';
import { OmnivaHarness } from './support/omniva-harness.js';
import { ScriptedEmailSender } from './support/scripted-email-sender.js';
import { testConfig } from './support/test-environment.js';
import { currentSessionOf, signedInUser } from './support/users.js';
import type { Visitor } from './support/visitor.js';

const HARNESS_START = new Date('2027-03-01T09:00:00.000Z');
/** The car's registration expires on 10 March; its reminder comes three days before. */
const REGISTRATION_EXPIRES_ON = '2027-03-10';
const REMINDER_DAY = new Date('2027-03-07T09:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;
const DELIVERY_TIMEOUT_MS = 15_000;
const UNREACHABLE_REDIS_URL = 'redis://127.0.0.1:1';

interface Reminded {
  readonly visitor: Visitor;
  readonly email: string;
  readonly workspaceId: string;
  readonly recordId: string;
}

/** A user with a car whose one reminder is due on REMINDER_DAY, scheduled and waiting. */
async function userWithAReminderDue(omniva: OmnivaHarness): Promise<Reminded> {
  omniva.clock.setTo(HARNESS_START);
  const visitor = await signedInUser(omniva);
  const session = await currentSessionOf(visitor);
  const workspaceId = session.personalWorkspace.id;
  const { data } = await visitor.api.POST('/v1/workspaces/{workspaceId}/records', {
    params: { path: { workspaceId } },
    body: {
      typeKey: 'vehicle',
      title: 'Daily driver',
      fields: { registrationExpiresOn: REGISTRATION_EXPIRES_ON },
      reminderRules: [{ keyDateField: 'registrationExpiresOn', daysBefore: 3 }],
    },
  });
  if (!data) throw new Error('The car was not created');
  await omniva.recordChangesPassedOn();
  return { visitor, email: session.user.email, workspaceId, recordId: data.id };
}

/** How the car's registration reminder shows on the user's attention list. */
async function remindedVia({ visitor, workspaceId, recordId }: Reminded) {
  const { data } = await visitor.api.GET('/v1/workspaces/{workspaceId}/key-dates/attention', {
    params: { path: { workspaceId } },
  });
  return data?.upcoming.find((item) => item.recordId === recordId)?.remindedVia;
}

const isReminder = (subject: string): boolean => subject.startsWith('Reminder:');

async function remindersTo(omniva: OmnivaHarness, { email }: Reminded) {
  return (await omniva.mail.messagesTo(email)).filter(({ subject }) => isReminder(subject));
}

/**
 * Ends the database connections of every transaction holding a reminder's email, as the death
 * of the worker process would. Resolves to how many it ended.
 */
async function cutConnectionsSendingEmail(): Promise<number> {
  return withDatabaseAdmin(async (admin) => {
    const { rows } = await admin.query<{ pid: number }>(
      `SELECT pid FROM pg_stat_activity
       WHERE datname = current_database() AND state = 'idle in transaction'
         AND query LIKE '%FROM reminder_delivery%FOR UPDATE SKIP LOCKED%'`,
    );
    for (const { pid } of rows) await admin.query('SELECT pg_terminate_backend($1)', [pid]);
    return rows.length;
  });
}

/** Checks on several later days, so any second send would have happened. */
async function laterChecks(omniva: OmnivaHarness): Promise<void> {
  for (let day = 0; day < 3; day += 1) {
    omniva.clock.advanceBy(DAY_MS);
    await omniva.remindersChecked();
  }
}

/**
 * Exactly one email per due notice, whatever goes wrong on the way (ADR 0012; spec, Testing
 * Decisions, Seam 1). Zero missed or wrong reminders is a hard gate (spec, M8).
 */
describe('reminder delivery under faults', () => {
  let omniva: OmnivaHarness;
  const email = new ScriptedEmailSender(testConfig());

  beforeAll(async () => {
    omniva = await OmnivaHarness.start({ workerEmailSender: email });
  });
  afterAll(async () => {
    await omniva.stop();
  });

  it('retries after the mail provider fails, and sends exactly one email', async () => {
    const user = await userWithAReminderDue(omniva);
    email.failNextSendTo(user.email);

    omniva.clock.setTo(REMINDER_DAY);
    await omniva.remindersChecked();
    await omniva.remindersChecked();
    await laterChecks(omniva);

    expect(email.attemptsTo(user.email).filter(isReminder)).toHaveLength(2);
    expect(await remindersTo(omniva, user)).toHaveLength(1);
  });

  it('shows a reminder in the app at once while its email keeps failing, and emails it once when the provider recovers', async () => {
    const user = await userWithAReminderDue(omniva);
    for (let failure = 0; failure < 3; failure += 1) email.failNextSendTo(user.email);

    omniva.clock.setTo(REMINDER_DAY);
    await omniva.remindersChecked();
    const whileFailing = await remindedVia(user);
    await omniva.remindersChecked();
    await omniva.remindersChecked();
    await omniva.remindersChecked();
    await laterChecks(omniva);

    expect(whileFailing).toBe('app');
    expect(await remindedVia(user)).toBe('email');
    expect(email.attemptsTo(user.email).filter(isReminder)).toHaveLength(4);
    expect(await remindersTo(omniva, user)).toHaveLength(1);
  });

  it('sends exactly one email after the worker dies in the middle of sending it, before the mail server took it', async () => {
    const user = await userWithAReminderDue(omniva);
    const held = email.holdNextSendTo(user.email);

    omniva.clock.setTo(REMINDER_DAY);
    await held.reached;
    // The process dies: PostgreSQL loses the transaction holding the email, and the send in
    // flight never reaches the mail server.
    const cut = await cutConnectionsSendingEmail();
    const stopping = omniva.stopWorker();
    held.fail();
    await stopping;
    const whileStopped = await remindersTo(omniva, user);
    const inTheApp = await remindedVia(user);
    await omniva.startWorker();

    expect(cut).toBe(1);
    expect(whileStopped).toEqual([]);
    expect(inTheApp).toBe('app');
    await expect
      .poll(() => remindersTo(omniva, user), { timeout: DELIVERY_TIMEOUT_MS })
      .toHaveLength(1);
    await laterChecks(omniva);
    expect(await remindersTo(omniva, user)).toHaveLength(1);
  });

  it('sends exactly one email when the record’s change notification is delivered twice', async () => {
    const user = await userWithAReminderDue(omniva);
    omniva.clock.setTo(REMINDER_DAY);
    await expect
      .poll(() => remindersTo(omniva, user), { timeout: DELIVERY_TIMEOUT_MS })
      .toHaveLength(1);

    await omniva.queueRecordChangeAgain({
      workspaceId: user.workspaceId,
      recordId: user.recordId,
      action: 'created',
      occurredAt: HARNESS_START.toISOString(),
    });
    await omniva.recordChangesPassedOn();
    await laterChecks(omniva);

    expect(await remindersTo(omniva, user)).toHaveLength(1);
  });

  it('sends exactly one email when two workers take up the same reminder at once', async () => {
    const user = await userWithAReminderDue(omniva);
    const held = email.holdNextSendTo(user.email);

    omniva.clock.setTo(REMINDER_DAY);
    await held.reached;
    const another = await omniva.startAnotherWorker();
    try {
      await another.remindersChecked();
      const whileTheFirstSends = await remindersTo(omniva, user);
      held.deliver();
      await expect
        .poll(() => remindersTo(omniva, user), { timeout: DELIVERY_TIMEOUT_MS })
        .toHaveLength(1);
      await another.remindersChecked();
      await laterChecks(omniva);

      expect(whileTheFirstSends).toEqual([]);
      expect(await remindersTo(omniva, user)).toHaveLength(1);
    } finally {
      await another.stop();
    }
  });
});

describe('reminder delivery with Redis unavailable', () => {
  let omniva: OmnivaHarness;

  beforeAll(async () => {
    omniva = await OmnivaHarness.start({ environment: { REDIS_URL: UNREACHABLE_REDIS_URL } });
  });
  afterAll(async () => {
    await omniva.stop();
  });

  it('still sends exactly one email, as reminders never depend on Redis', async () => {
    const user = await userWithAReminderDue(omniva);

    omniva.clock.setTo(REMINDER_DAY);
    await expect
      .poll(() => remindersTo(omniva, user), { timeout: DELIVERY_TIMEOUT_MS })
      .toHaveLength(1);
    await laterChecks(omniva);

    expect(await remindersTo(omniva, user)).toHaveLength(1);
  });
});
