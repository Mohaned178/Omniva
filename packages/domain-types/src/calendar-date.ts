/**
 * A date on the calendar with no time of day and no time zone, as Key dates are stored
 * (CODING_STANDARDS §6). `month` runs 1–12 and `day` 1–31.
 */
export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}
