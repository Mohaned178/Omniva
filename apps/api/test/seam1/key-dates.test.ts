import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OmnivaHarness } from './support/omniva-harness.js';
import { currentSessionOf, signedInUser } from './support/users.js';
import type { Visitor } from './support/visitor.js';

// The harness clock starts on 1 March 2027.
const IN_THREE_DAYS = '2027-03-04';
const A_QUARTER_YEAR_AWAY = '2027-06-15';
const NINETEEN_DAYS_AGO = '2027-02-10';
const LONG_AGO = '2026-11-01';
const NEXT_MONTH = '2027-04';
const LATER_THIS_YEAR = '2027-09';

/** Key dates, traced through a Vehicle (spec D42–D46). */
describe('Key dates', () => {
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

  async function createCar(
    fields: Record<string, string | number>,
    acknowledgeImplausibleDates?: boolean,
  ) {
    return me.api.POST('/v1/workspaces/{workspaceId}/records', {
      params: { path: { workspaceId } },
      body: {
        typeKey: 'vehicle',
        title: `Car ${crypto.randomUUID()}`,
        fields,
        ...(acknowledgeImplausibleDates !== undefined && { acknowledgeImplausibleDates }),
      },
    });
  }

  async function createdCarId(fields: Record<string, string | number>): Promise<string> {
    const { data } = await createCar(fields);
    if (!data) throw new Error('The car was not created');
    return data.id;
  }

  async function attention() {
    const { data } = await me.api.GET('/v1/workspaces/{workspaceId}/key-dates/attention', {
      params: { path: { workspaceId } },
    });
    if (!data) throw new Error('The attention list was not returned');
    return data;
  }

  async function upcomingFor(recordId: string) {
    return (await attention()).upcoming.filter((item) => item.recordId === recordId);
  }

  async function missingFor(recordId: string) {
    return (await attention()).missing.filter((item) => item.recordId === recordId);
  }

  describe('precision', () => {
    it('keeps a Key date given as an exact day, as a month only, or as missing', async () => {
      const { data, response } = await createCar({
        registrationExpiresOn: '2027-06-30',
        inspectionDueOn: 'missing',
      });
      const monthOnly = await createCar({ registrationExpiresOn: '2027-03' });

      expect(response.status).toBe(201);
      expect(data?.fields).toEqual({
        registrationExpiresOn: '2027-06-30',
        inspectionDueOn: 'missing',
      });
      expect(monthOnly.data?.fields).toEqual({ registrationExpiresOn: '2027-03' });
    });

    it.each([
      ['a Key date that is not a date', { registrationExpiresOn: 'soon' }],
      ['a month with no real number', { registrationExpiresOn: '2027-13' }],
      ['a month-only value in a date that is not a Key date', { purchasedOn: '2019-02' }],
      ['the missing mark in a date that is not a Key date', { purchasedOn: 'missing' }],
    ])('refuses %s', async (_case, fields) => {
      const attempt = await createCar(fields);

      expect(attempt.response.status).toBe(400);
      expect(attempt.error?.code).toBe('INVALID_INPUT');
    });
  });

  describe('plausibility', () => {
    it.each([
      ['a year like 2205', { registrationExpiresOn: '2205-01-01' }],
      ['a year in the distant past', { inspectionDueOn: '1850-05-05' }],
      [
        'an expiry before the purchase',
        { purchasedOn: '2020-06-01', registrationExpiresOn: '2019-06-01' },
      ],
    ])('stops %s before saving, creating nothing', async (_case, fields) => {
      const before = await me.api.GET('/v1/workspaces/{workspaceId}/records', {
        params: { path: { workspaceId }, query: { module: 'assets' } },
      });

      const attempt = await createCar(fields);

      const after = await me.api.GET('/v1/workspaces/{workspaceId}/records', {
        params: { path: { workspaceId }, query: { module: 'assets' } },
      });
      expect(attempt.response.status).toBe(409);
      expect(attempt.error?.code).toBe('IMPLAUSIBLE_DATES');
      expect(after.data?.records).toHaveLength(before.data?.records.length ?? -1);
    });

    it('saves the date as given once the user has seen the warning and confirms', async () => {
      const attempt = await createCar({ registrationExpiresOn: '2205-01-01' }, true);

      expect(attempt.response.status).toBe(201);
      expect(attempt.data?.fields).toEqual({ registrationExpiresOn: '2205-01-01' });
    });

    it('stops an edit that makes a date implausible and keeps the record as it was', async () => {
      const recordId = await createdCarId({ registrationExpiresOn: '2027-06-30' });

      const edit = await me.api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
        params: { path: { workspaceId, recordId } },
        body: { fields: { registrationExpiresOn: '2205-06-30' } },
      });
      const shown = await me.api.GET('/v1/workspaces/{workspaceId}/records/{recordId}', {
        params: { path: { workspaceId, recordId } },
      });

      expect(edit.response.status).toBe(409);
      expect(shown.data?.fields).toEqual({ registrationExpiresOn: '2027-06-30' });
    });

    it('does not second-guess a month-only expiry that may still follow the purchase', async () => {
      const attempt = await createCar({
        purchasedOn: '2027-03-20',
        registrationExpiresOn: '2027-03',
      });

      expect(attempt.response.status).toBe(201);
    });
  });

  describe('the attention list', () => {
    it('shows a Key date coming up, with how many days away it is', async () => {
      const recordId = await createdCarId({ registrationExpiresOn: IN_THREE_DAYS });

      expect(await upcomingFor(recordId)).toEqual([
        expect.objectContaining({
          recordId,
          typeKey: 'vehicle',
          fieldKey: 'registrationExpiresOn',
          precision: 'exact',
          date: IN_THREE_DAYS,
          daysUntil: 3,
        }),
      ]);
    });

    it('counts a month-only date from the first of its month', async () => {
      const recordId = await createdCarId({ inspectionDueOn: NEXT_MONTH });

      expect(await upcomingFor(recordId)).toEqual([
        expect.objectContaining({ precision: 'month', date: '2027-04-01', daysUntil: 31 }),
      ]);
    });

    it('keeps a date that passed recently, and leaves out one far ahead or long past', async () => {
      const recentlyPassed = await createdCarId({ registrationExpiresOn: NINETEEN_DAYS_AGO });
      const farAhead = await createdCarId({ registrationExpiresOn: A_QUARTER_YEAR_AWAY });
      const longPast = await createdCarId({ registrationExpiresOn: LONG_AGO });
      const laterMonth = await createdCarId({ registrationExpiresOn: LATER_THIS_YEAR });

      expect(await upcomingFor(recentlyPassed)).toEqual([
        expect.objectContaining({ daysUntil: -19 }),
      ]);
      expect(await upcomingFor(farAhead)).toEqual([]);
      expect(await upcomingFor(longPast)).toEqual([]);
      expect(await upcomingFor(laterMonth)).toEqual([]);
    });

    it('lists first what is coming soonest', async () => {
      await createdCarId({ registrationExpiresOn: '2027-04-20' });
      await createdCarId({ registrationExpiresOn: IN_THREE_DAYS });
      await createdCarId({ registrationExpiresOn: '2027-03-30' });

      const days = (await attention()).upcoming.map(({ daysUntil }) => daysUntil);

      expect(days).toEqual([...days].sort((a, b) => a - b));
    });

    it('lists a date the user marked missing, apart from what is coming, and never a blank one', async () => {
      const marked = await createdCarId({ inspectionDueOn: 'missing' });
      const blank = await createdCarId({ make: 'Toyota' });

      expect(await missingFor(marked)).toEqual([
        expect.objectContaining({ recordId: marked, fieldKey: 'inspectionDueOn' }),
      ]);
      expect(await upcomingFor(marked)).toEqual([]);
      expect(await missingFor(blank)).toEqual([]);
    });

    it('follows the record: an edit moves the date, and clearing it takes it off the list', async () => {
      const recordId = await createdCarId({ registrationExpiresOn: IN_THREE_DAYS });
      const edit = (fields: Record<string, string>) =>
        me.api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
          params: { path: { workspaceId, recordId } },
          body: { fields },
        });

      await edit({ registrationExpiresOn: '2027-03-10' });
      const moved = await upcomingFor(recordId);
      await edit({ registrationExpiresOn: 'missing' });
      const marked = { upcoming: await upcomingFor(recordId), missing: await missingFor(recordId) };
      await edit({ make: 'Toyota' });
      const cleared = {
        upcoming: await upcomingFor(recordId),
        missing: await missingFor(recordId),
      };

      expect(moved).toEqual([expect.objectContaining({ date: '2027-03-10', daysUntil: 9 })]);
      expect(marked.upcoming).toEqual([]);
      expect(marked.missing).toHaveLength(1);
      expect(cleared).toEqual({ upcoming: [], missing: [] });
    });

    it('leaves out the dates of an archived record until it is brought back', async () => {
      const recordId = await createdCarId({
        registrationExpiresOn: IN_THREE_DAYS,
        inspectionDueOn: 'missing',
      });
      const path = { workspaceId, recordId };

      await me.api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/archive', {
        params: { path },
      });
      const whileArchived = [await upcomingFor(recordId), await missingFor(recordId)];
      await me.api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/unarchive', {
        params: { path },
      });

      expect(whileArchived).toEqual([[], []]);
      expect(await upcomingFor(recordId)).toHaveLength(1);
      expect(await missingFor(recordId)).toHaveLength(1);
    });

    it('moves with the clock: tomorrow the same date is a day closer', async () => {
      const recordId = await createdCarId({ registrationExpiresOn: IN_THREE_DAYS });
      omniva.clock.advanceBy(24 * 60 * 60 * 1000);

      const [item] = await upcomingFor(recordId);
      omniva.clock.advanceBy(-24 * 60 * 60 * 1000);

      expect(item?.daysUntil).toBe(2);
    });
  });
});
