export type DistanceUnit = 'days' | 'weeks' | 'months' | 'years';

/** How far a date is from today, as data the app words in the user's language. */
export type Distance =
  | { readonly unit: 'today'; readonly count: 0 }
  | {
      readonly unit: DistanceUnit;
      readonly count: number;
      readonly direction: 'ahead' | 'behind';
    };

const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;
/** Up to this many days a distance is counted in days ("in 13 days"), then in weeks. */
const DAYS_BEFORE_WEEKS = 14;
/** Up to this many days it is counted in weeks, then in months. */
const DAYS_BEFORE_MONTHS = 60;

/** Puts a number of days from today (negative once past) in the plainest unit. */
export function distanceInWords(daysFromToday: number): Distance {
  if (daysFromToday === 0) return { unit: 'today', count: 0 };
  const direction = daysFromToday > 0 ? 'ahead' : 'behind';
  const days = Math.abs(daysFromToday);
  if (days < DAYS_BEFORE_WEEKS) return { unit: 'days', count: days, direction };
  if (days < DAYS_BEFORE_MONTHS) {
    return { unit: 'weeks', count: Math.floor(days / DAYS_PER_WEEK), direction };
  }
  if (days < DAYS_PER_YEAR) {
    return { unit: 'months', count: Math.floor(days / DAYS_PER_MONTH), direction };
  }
  return { unit: 'years', count: Math.floor(days / DAYS_PER_YEAR), direction };
}
