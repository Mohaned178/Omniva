/**
 * Where a record stands in its own life, by building block (GLOSSARY.md, Lifecycle state):
 * an Item is owned or disposed; an Obligation active, ending or ended; a Document valid or
 * expired; a Task open or done; a Plan upcoming, in progress or past.
 */
export const LIFECYCLE_STATES = [
  'owned',
  'disposed',
  'active',
  'ending',
  'ended',
  'valid',
  'expired',
  'open',
  'done',
  'upcoming',
  'in_progress',
  'past',
] as const;

export type LifecycleState = (typeof LIFECYCLE_STATES)[number];
