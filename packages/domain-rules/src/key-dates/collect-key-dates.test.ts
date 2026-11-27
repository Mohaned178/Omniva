import { describe, expect, it } from 'vitest';
import { collectKeyDates } from './collect-key-dates.js';

describe('collectKeyDates', () => {
  it('takes only the Type’s Key date fields, each with its precision', () => {
    expect(
      collectKeyDates(['expiresOn', 'renewsOn', 'inspectionDueOn'], {
        make: 'Toyota',
        purchasedOn: '2020-01-01',
        expiresOn: '2027-06-30',
        renewsOn: '2027-03',
        inspectionDueOn: 'missing',
      }),
    ).toEqual([
      { field: 'expiresOn', precision: 'exact', day: { year: 2027, month: 6, day: 30 } },
      { field: 'renewsOn', precision: 'month', day: { year: 2027, month: 3, day: 1 } },
      { field: 'inspectionDueOn', precision: 'missing' },
    ]);
  });

  it('leaves out a Key date field the record does not hold, so a blank is not a missing date', () => {
    expect(collectKeyDates(['expiresOn', 'renewsOn'], { expiresOn: '2027-06-30' })).toEqual([
      { field: 'expiresOn', precision: 'exact', day: { year: 2027, month: 6, day: 30 } },
    ]);
    expect(collectKeyDates(['expiresOn'], {})).toEqual([]);
  });

  it('holds only dates it can read, ignoring a value that is no date', () => {
    expect(collectKeyDates(['expiresOn'], { expiresOn: 42 })).toEqual([]);
    expect(collectKeyDates(['expiresOn'], { expiresOn: 'soon' })).toEqual([]);
  });
});
