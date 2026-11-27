import type { CalendarDate } from './calendar-date.js';

/**
 * A date as a user gave it: an exact day, a month only ("March 2027"), or marked missing
 * because they don't know it yet (GLOSSARY.md, Month-only date, Date missing). `month` runs 1–12.
 */
export type DateValue =
  | { readonly precision: 'exact'; readonly date: CalendarDate }
  | { readonly precision: 'month'; readonly year: number; readonly month: number }
  | { readonly precision: 'missing' };
