/**
 * The ten building blocks every record is built from (GLOSSARY.md). Never shown to users as
 * words.
 */
export const BLOCKS = [
  'item',
  'document',
  'money_record',
  'obligation',
  'event',
  'task',
  'person',
  'note',
  'plan',
  'measurement',
] as const;

export type Block = (typeof BLOCKS)[number];
