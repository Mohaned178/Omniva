import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OmnivaHarness } from './support/omniva-harness.js';
import { ScriptedEmailSender } from './support/scripted-email-sender.js';
import { testConfig } from './support/test-environment.js';
import { currentSessionOf, signedInUser } from './support/users.js';

const HARNESS_START = new Date('2027-03-01T09:00:00.000Z');
/** The car's registration expires on 10 March; its reminder comes three days before. */
const REGISTRATION_EXPIRES_ON = '2027-03-10';
const REMINDER_DAY = new Date('2027-03-07T09:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;
const DELIVERY_TIMEOUT_MS = 15_000;
const UNREACHABLE_REDIS_URL = 'redis://127.0.0.1:1';

interface Reminded {
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
  return { email: session.user.email, workspaceId, recordId: data.id };
}

const isReminder = (subject: string): boolean => subject.startsWith('Reminder:');

async function remindersTo(omniva: OmnivaHarness, { email }: Reminded) {
  return (await omniva.mail.messagesTo(email)).filter(({ subject }) => isReminder(subject));
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

  it('sends exactly one email after the worker is stopped in the middle of sending it', async () => {
    const user = await userWithAReminderDue(omniva);
    const held = email.holdNextSendTo(user.email);

    omniva.clock.setTo(REMINDER_DAY);
    await held.reached;
    const stopping = omniva.stopWorker();
    held.fail();
    await stopping;
    const whileStopped = await remindersTo(omniva, user);
    await omniva.startWorker();

    expect(whileStopped).toEqual([]);
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
