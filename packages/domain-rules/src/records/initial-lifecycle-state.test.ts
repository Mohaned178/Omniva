import { describe, expect, it } from 'vitest';
import type { Block, LifecycleState } from '@omniva/domain-types';
import { initialLifecycleState } from './initial-lifecycle-state.js';

// GLOSSARY.md, Lifecycle state: an Item is owned or disposed; an Obligation active, ending or
// ended; a Document valid or expired; a Task open or done; a Plan upcoming, in progress or past.
// A new record starts at the beginning of its block's life; the other blocks have none.
const EXPECTED: readonly (readonly [block: Block, state: LifecycleState | undefined])[] = [
  ['item', 'owned'],
  ['obligation', 'active'],
  ['document', 'valid'],
  ['task', 'open'],
  ['plan', 'upcoming'],
  ['money_record', undefined],
  ['event', undefined],
  ['person', undefined],
  ['note', undefined],
  ['measurement', undefined],
];

describe('initialLifecycleState', () => {
  it.each(EXPECTED)('a new %s starts %s', (block, state) => {
    expect(initialLifecycleState(block)).toBe(state);
  });
});
