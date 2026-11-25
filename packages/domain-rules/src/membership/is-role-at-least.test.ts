import { describe, expect, it } from 'vitest';
import type { MemberRole } from '@omniva/domain-types';
import { isRoleAtLeast } from './is-role-at-least.js';

// GLOSSARY.md, Member: a role is Owner, Editor or Viewer. Each role may do everything the
// roles below it may, and nothing above.
const EXPECTED: readonly (readonly [role: MemberRole, minimum: MemberRole, allowed: boolean])[] = [
  ['owner', 'owner', true],
  ['owner', 'editor', true],
  ['owner', 'viewer', true],
  ['editor', 'owner', false],
  ['editor', 'editor', true],
  ['editor', 'viewer', true],
  ['viewer', 'owner', false],
  ['viewer', 'editor', false],
  ['viewer', 'viewer', true],
];

describe('isRoleAtLeast', () => {
  it.each(EXPECTED)('a member with role %s may do what needs %s: %s', (role, minimum, allowed) => {
    expect(isRoleAtLeast(role, minimum)).toBe(allowed);
  });
});
