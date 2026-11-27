import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { CaughtMessage } from './support/mail-catcher.js';
import { OmnivaHarness } from './support/omniva-harness.js';
import { currentSessionOf, signedInUser } from './support/users.js';
import type { Visitor } from './support/visitor.js';

const DAY_MS = 24 * 60 * 60 * 1000;
/** The worker's email goes out in wall-clock time, so a test waits for it. */
const DELIVERY_TIMEOUT_MS = 15_000;
const HARNESS_START = new Date('2027-03-01T09:00:00.000Z');

interface ReminderUser {
  readonly visitor: Visitor;
  readonly email: string;
  readonly workspaceId: string;
}

/** Reminders by email and in-app, each exactly once (spec D47–D49, D52, D54, D57; ADR 0012). */
describe('Reminders', () => {
  let omniva: OmnivaHarness;

  beforeAll(async () => {
    omniva = await OmnivaHarness.start();
  });
  afterAll(async () => {
    await omniva.stop();
  });

  /** A new user, so the reminders in their inbox are only the ones a test made. */
  async function newUser(): Promise<ReminderUser> {
    omniva.clock.setTo(HARNESS_START);
    const visitor = await signedInUser(omniva);
    const session = await currentSessionOf(visitor);
    return { visitor, email: session.user.email, workspaceId: session.personalWorkspace.id };
  }

  async function createCar(
    { visitor, workspaceId }: ReminderUser,
    title: string,
    fields: Record<string, string>,
    reminderRules?: readonly { keyDateField: string; daysBefore: number }[],
  ): Promise<string> {
    const { data } = await visitor.api.POST('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId } },
      body: {
        typeKey: 'vehicle',
        title,
        fields,
        ...(reminderRules !== undefined && { reminderRules: [...reminderRules] }),
      },
    });
    if (!data) throw new Error('The car was not created');
    await omniva.recordChangesPassedOn();
    return data.id;
  }

  async function remindersTo({ email }: ReminderUser): Promise<readonly CaughtMessage[]> {
    return (await omniva.mail.messagesTo(email)).filter(({ subject }) =>
      subject.startsWith('Reminder:'),
    );
  }

  async function attentionFor({ visitor, workspaceId }: ReminderUser, recordId: string) {
    const { data } = await visitor.api.GET('/v1/workspaces/{workspaceId}/key-dates/attention', {
      params: { path: { workspaceId } },
    });
    if (!data) throw new Error('The attention list was not returned');
    return {
      upcoming: data.upcoming.filter((item) => item.recordId === recordId),
      missing: data.missing.filter((item) => item.recordId === recordId),
    };
  }

  async function setReminder(
    { visitor, workspaceId }: ReminderUser,
    recordId: string,
    body:
      | { readonly date: string; readonly status: 'handled' | 'open' }
      | { readonly date: string; readonly status: 'snoozed'; readonly until: string },
    fieldKey = 'registrationExpiresOn',
  ) {
    const result = await visitor.api.PUT(
      '/v1/workspaces/{workspaceId}/records/{recordId}/key-dates/{fieldKey}/reminder',
      { params: { path: { workspaceId, recordId, fieldKey } }, body },
    );
    await omniva.recordChangesPassedOn();
    return result;
  }

  /** Moves the clock a day at a time, letting the worker check at each step. */
  async function daysPass(days: number): Promise<void> {
    for (let day = 0; day < days; day += 1) {
      omniva.clock.advanceBy(DAY_MS);
      await omniva.remindersChecked();
    }
  }

  it('emails a reminder whose date is near once, straight away, and never again', async () => {
    const user = await newUser();
    await createCar(user, 'Family car', { registrationExpiresOn: '2027-03-06' });

    await expect
      .poll(() => remindersTo(user), { timeout: DELIVERY_TIMEOUT_MS })
      .toEqual([{ subject: 'Reminder: Family car', to: [user.email] }]);
    await daysPass(10);

    expect(await remindersTo(user)).toHaveLength(1);
  });

  it('reminds by the user’s own rule instead of the Type’s, on its day and not before', async () => {
    const user = await newUser();
    const recordId = await createCar(user, 'Van', { registrationExpiresOn: '2027-03-20' }, [
      { keyDateField: 'registrationExpiresOn', daysBefore: 3 },
    ]);

    await daysPass(15);
    const dayBefore = await remindersTo(user);
    await daysPass(1);

    expect(dayBefore).toEqual([]);
    const reminder = await omniva.mail.waitForMessageTo(user.email);
    expect(reminder.subject).toBe('Reminder: Van');
    expect(reminder.text).toContain('Van has an important date in 3 days, on 20 March 2027.');
    expect(reminder.text).toContain(`http://localhost:3000/app/records/${recordId}`);
  });

  it('marks a reminder that is not urgent for the digest instead of emailing it, and shows it in-app', async () => {
    const user = await newUser();
    // The Type's default: 30 days before, so on 16 March, with a month still to go.
    const recordId = await createCar(user, 'Estate', { registrationExpiresOn: '2027-04-15' });

    await daysPass(14);
    const before = await attentionFor(user, recordId);
    await daysPass(1);

    expect(before.upcoming).toEqual([expect.objectContaining({ remindedVia: null })]);
    expect((await attentionFor(user, recordId)).upcoming).toEqual([
      expect.objectContaining({ fieldKey: 'registrationExpiresOn', remindedVia: 'digest' }),
    ]);
    expect(await remindersTo(user)).toEqual([]);
  });

  it('reminds of a month-only date counting from the first of its month', async () => {
    const user = await newUser();
    await createCar(user, 'Hatchback', { inspectionDueOn: '2027-04' }, [
      { keyDateField: 'inspectionDueOn', daysBefore: 3 },
    ]);

    await daysPass(27);
    const dayBefore = await remindersTo(user);
    await daysPass(1);

    expect(dayBefore).toEqual([]);
    const reminder = await omniva.mail.waitForMessageTo(user.email);
    expect(reminder.text).toContain('Hatchback has an important date sometime in April 2027.');
  });

  it('lists a missing date for attention but never reminds of it', async () => {
    const user = await newUser();
    const recordId = await createCar(user, 'Coupé', { inspectionDueOn: 'missing' }, [
      { keyDateField: 'inspectionDueOn', daysBefore: 0 },
    ]);

    await daysPass(3);

    expect((await attentionFor(user, recordId)).missing).toEqual([
      expect.objectContaining({ fieldKey: 'inspectionDueOn' }),
    ]);
    expect(await remindersTo(user)).toEqual([]);
  });

  it('sends nothing for an archived record until it is brought back', async () => {
    const user = await newUser();
    const recordId = await createCar(user, 'Spare car', { registrationExpiresOn: '2027-03-10' }, [
      { keyDateField: 'registrationExpiresOn', daysBefore: 5 },
    ]);
    const path = { workspaceId: user.workspaceId, recordId };

    await user.visitor.api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/archive', {
      params: { path },
    });
    await omniva.recordChangesPassedOn();
    await daysPass(5);
    const whileArchived = await remindersTo(user);
    await user.visitor.api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/unarchive', {
      params: { path },
    });
    await omniva.recordChangesPassedOn();

    expect(whileArchived).toEqual([]);
    await expect.poll(() => remindersTo(user), { timeout: DELIVERY_TIMEOUT_MS }).toHaveLength(1);
  });

  describe('reminder rules', () => {
    it('gives a new record its Type’s default reminders, visible on the record', async () => {
      const user = await newUser();
      const recordId = await createCar(user, 'Saloon', {});

      const { data } = await user.visitor.api.GET(
        '/v1/workspaces/{workspaceId}/records/{recordId}',
        { params: { path: { workspaceId: user.workspaceId, recordId } } },
      );

      expect(data?.reminderRules).toEqual([
        { keyDateField: 'registrationExpiresOn', daysBefore: 30 },
        { keyDateField: 'inspectionDueOn', daysBefore: 30 },
      ]);
    });

    it('lets the user change a record’s reminders, which then come by the new rule', async () => {
      const user = await newUser();
      const recordId = await createCar(user, 'Moped', { registrationExpiresOn: '2027-04-30' });

      const edit = await user.visitor.api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
        params: { path: { workspaceId: user.workspaceId, recordId } },
        body: { reminderRules: [{ keyDateField: 'registrationExpiresOn', daysBefore: 3 }] },
      });
      await omniva.recordChangesPassedOn();
      omniva.clock.setTo(new Date('2027-04-27T09:00:00.000Z'));

      expect(edit.data?.reminderRules).toEqual([
        { keyDateField: 'registrationExpiresOn', daysBefore: 3 },
      ]);
      await expect.poll(() => remindersTo(user), { timeout: DELIVERY_TIMEOUT_MS }).toHaveLength(1);
      expect((await omniva.mail.waitForMessageTo(user.email)).text).toContain('in 3 days');
    });

    it.each([
      ['a date the Type does not have', { keyDateField: 'purchasedOn', daysBefore: 3 }],
      ['a reminder after the date', { keyDateField: 'registrationExpiresOn', daysBefore: -1 }],
    ])('refuses a reminder rule for %s', async (_case, rule) => {
      const user = await newUser();

      const attempt = await user.visitor.api.POST('/v1/workspaces/{workspaceId}/records', {
        params: { path: { workspaceId: user.workspaceId } },
        body: { typeKey: 'vehicle', title: 'Kit car', fields: {}, reminderRules: [rule] },
      });

      expect(attempt.response.status).toBe(400);
      expect(attempt.error?.code).toBe('INVALID_INPUT');
    });
  });

  describe('handling', () => {
    it('keeps a reminded date on the attention list long after it has passed, until it is handled', async () => {
      const user = await newUser();
      const recordId = await createCar(user, 'Pickup', { registrationExpiresOn: '2027-03-06' });
      await expect.poll(() => remindersTo(user), { timeout: DELIVERY_TIMEOUT_MS }).toHaveLength(1);

      await daysPass(40);
      const longAfter = await attentionFor(user, recordId);
      const handled = await setReminder(user, recordId, { date: '2027-03-06', status: 'handled' });

      expect(longAfter.upcoming).toEqual([
        expect.objectContaining({ daysUntil: -35, remindedVia: 'email' }),
      ]);
      expect(handled.response.status).toBe(200);
      expect(handled.data).toEqual({
        recordId,
        fieldKey: 'registrationExpiresOn',
        date: '2027-03-06',
        status: 'handled',
        snoozedUntil: null,
      });
      expect((await attentionFor(user, recordId)).upcoming).toEqual([]);
    });

    it('sends nothing more for a handled date, and reminds afresh once a new date is entered', async () => {
      const user = await newUser();
      const recordId = await createCar(user, 'Camper', { registrationExpiresOn: '2027-03-20' }, [
        { keyDateField: 'registrationExpiresOn', daysBefore: 7 },
        { keyDateField: 'registrationExpiresOn', daysBefore: 1 },
      ]);
      await daysPass(12);
      const atAWeek = await remindersTo(user);

      await setReminder(user, recordId, { date: '2027-03-20', status: 'handled' });
      await daysPass(6);
      const afterHandling = await remindersTo(user);
      await user.visitor.api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
        params: { path: { workspaceId: user.workspaceId, recordId } },
        body: { fields: { registrationExpiresOn: '2028-03-20' } },
      });
      await omniva.recordChangesPassedOn();
      omniva.clock.setTo(new Date('2028-03-12T09:00:00.000Z'));
      await daysPass(1);

      expect(atAWeek).toHaveLength(1);
      expect(afterHandling).toHaveLength(1);
      expect(await remindersTo(user)).toHaveLength(2);
    });

    it('brings a handled reminder back when the user reopens it', async () => {
      const user = await newUser();
      const recordId = await createCar(user, 'Roadster', { registrationExpiresOn: '2027-03-25' });

      await setReminder(user, recordId, { date: '2027-03-25', status: 'handled' });
      const reopened = await setReminder(user, recordId, { date: '2027-03-25', status: 'open' });

      expect(reopened.data?.status).toBe('open');
      expect((await attentionFor(user, recordId)).upcoming).toHaveLength(1);
    });

    it('takes a snoozed reminder off the list until the chosen day, and sends then what fell in the snooze', async () => {
      const user = await newUser();
      const recordId = await createCar(user, 'Minibus', { registrationExpiresOn: '2027-03-20' }, [
        { keyDateField: 'registrationExpiresOn', daysBefore: 7 },
        { keyDateField: 'registrationExpiresOn', daysBefore: 2 },
      ]);
      await daysPass(12);
      const atAWeek = await remindersTo(user);

      const snoozed = await setReminder(user, recordId, {
        date: '2027-03-20',
        status: 'snoozed',
        until: '2027-03-19',
      });
      await daysPass(5);
      const lastDayOfSnooze = {
        reminders: await remindersTo(user),
        attention: await attentionFor(user, recordId),
      };
      await daysPass(1);

      expect(atAWeek).toHaveLength(1);
      expect(snoozed.data).toEqual(
        expect.objectContaining({ status: 'snoozed', snoozedUntil: '2027-03-19' }),
      );
      expect(lastDayOfSnooze.reminders).toHaveLength(1);
      expect(lastDayOfSnooze.attention.upcoming).toEqual([]);
      await expect.poll(() => remindersTo(user), { timeout: DELIVERY_TIMEOUT_MS }).toHaveLength(2);
      expect((await attentionFor(user, recordId)).upcoming).toEqual([
        expect.objectContaining({ daysUntil: 1, remindedVia: 'email' }),
      ]);
    });

    it('refuses a snooze that does not end on a day ahead', async () => {
      const user = await newUser();
      const recordId = await createCar(user, 'Tourer', { registrationExpiresOn: '2027-03-25' });

      const attempt = await setReminder(user, recordId, {
        date: '2027-03-25',
        status: 'snoozed',
        until: '2027-03-01',
      });

      expect(attempt.response.status).toBe(400);
      expect(attempt.error?.code).toBe('SNOOZE_NOT_AHEAD');
    });

    it('refuses to handle a date the record does not have', async () => {
      const user = await newUser();
      const recordId = await createCar(user, 'Saloon', { registrationExpiresOn: '2027-03-25' });

      const attempt = await setReminder(user, recordId, { date: '2027-03-26', status: 'handled' });

      expect(attempt.response.status).toBe(404);
      expect(attempt.error?.code).toBe('KEY_DATE_NOT_FOUND');
    });
  });
});
