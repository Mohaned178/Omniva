import type { Block, LifecycleState } from '@omniva/domain-types';

/**
 * The lifecycle state a new record of the block starts in (GLOSSARY.md, Lifecycle state), or
 * undefined for a block that has no lifecycle. A new Plan starts upcoming; whether it is in
 * progress or past depends on its dates, which the Plan's own rules decide later.
 */
export function initialLifecycleState(block: Block): LifecycleState | undefined {
  switch (block) {
    case 'item':
      return 'owned';
    case 'obligation':
      return 'active';
    case 'document':
      return 'valid';
    case 'task':
      return 'open';
    case 'plan':
      return 'upcoming';
    case 'money_record':
    case 'event':
    case 'person':
    case 'note':
    case 'measurement':
      return undefined;
    default: {
      const unknownBlock: never = block;
      throw new Error(`Unknown building block: ${String(unknownBlock)}`);
    }
  }
}
