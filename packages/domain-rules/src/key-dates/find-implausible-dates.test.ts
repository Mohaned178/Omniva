import { describe, expect, it } from 'vitest';
import type { DateValue } from '@omniva/domain-types';
import { findImplausibleDates } from './find-implausible-dates.js';
import { parseDateValue } from './parse-date-value.js';

const TODAY = { year: 2026, month: 11, day: 27 } as const;
const ISSUED_BEFORE_EXPIRY = [{ earlier: 'issuedOn', later: 'expiresOn' }] as const;

function datesOf(given: Readonly<Record<string, string>>): Readonly<Record<string, DateValue>> {
  return Object.fromEntries(
    Object.entries(given).map(([key, text]) => {
      const value = parseDateValue(text);
      if (!value) throw new Error(`Not a date: ${text}`);
      return [key, value];
    }),
  );
}

function implausible(
  given: Record<string, string>,
  order: readonly { earlier: string; later: string }[] = [],
) {
  return findImplausibleDates({ today: TODAY, dates: datesOf(given), order });
}

describe('findImplausibleDates', () => {
  it('lets ordinary dates through, whether exact, month-only or missing', () => {
    expect(
      implausible({
        renewsOn: '2027-03-15',
        inspectionDueOn: '2027-06',
        warrantyEndsOn: 'missing',
      }),
    ).toEqual([]);
  });

  it('flags a year like 2205 as too far ahead', () => {
    expect(implausible({ renewsOn: '2205-03-15' })).toEqual([
      { field: 'renewsOn', reason: 'too-far-ahead' },
    ]);
  });

  it('flags a date more than a century back as too far behind', () => {
    expect(implausible({ renewsOn: '1901-03-15' })).toEqual([
      { field: 'renewsOn', reason: 'too-far-behind' },
    ]);
  });

  it('judges a month-only date by its month', () => {
    expect(implausible({ renewsOn: '2205-03' })).toEqual([
      { field: 'renewsOn', reason: 'too-far-ahead' },
    ]);
  });

  it('accepts a date at the edge of the allowed years and flags the day beyond it', () => {
    expect(implausible({ ahead: '2056-11-27', behind: '1926-11-27' })).toEqual([]);
    expect(implausible({ ahead: '2056-11-28' })).toHaveLength(1);
    expect(implausible({ behind: '1926-11-26' })).toHaveLength(1);
  });

  it('flags an expiry that comes before its issue date', () => {
    expect(
      implausible({ issuedOn: '2027-03-15', expiresOn: '2026-03-14' }, ISSUED_BEFORE_EXPIRY),
    ).toEqual([{ field: 'expiresOn', reason: 'before-earlier-date', earlierField: 'issuedOn' }]);
  });

  it('lets an expiry fall on the day it was issued', () => {
    expect(
      implausible({ issuedOn: '2027-03-15', expiresOn: '2027-03-15' }, ISSUED_BEFORE_EXPIRY),
    ).toEqual([]);
  });

  it('flags an order only when a month-only date cannot make it right', () => {
    expect(
      implausible({ issuedOn: '2027-03-31', expiresOn: '2027-03' }, ISSUED_BEFORE_EXPIRY),
    ).toEqual([]);
    expect(
      implausible({ issuedOn: '2027-03', expiresOn: '2027-03-01' }, ISSUED_BEFORE_EXPIRY),
    ).toEqual([]);
    expect(
      implausible({ issuedOn: '2027-04', expiresOn: '2027-03-31' }, ISSUED_BEFORE_EXPIRY),
    ).toHaveLength(1);
  });

  it('ignores an order when either date is missing or not given', () => {
    expect(
      implausible({ issuedOn: 'missing', expiresOn: '2020-01-01' }, ISSUED_BEFORE_EXPIRY),
    ).toEqual([]);
    expect(implausible({ expiresOn: '2020-01-01' }, ISSUED_BEFORE_EXPIRY)).toEqual([]);
  });
});
