/**
 * One day a Key date falls on (GLOSSARY.md, Occurrence), as reminders store it: what a
 * reminder is delivered and handled for. A Key date given a new day is a new occurrence.
 */
export interface Occurrence {
  readonly recordId: string;
  readonly fieldKey: string;
  /** The Key date's day: the exact day, or the first of the month for a month-only date. */
  readonly occursOn: Date;
}
