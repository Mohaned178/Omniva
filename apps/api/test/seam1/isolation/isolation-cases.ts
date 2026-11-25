import { randomUUID } from 'node:crypto';
import type { CurrentSession } from '@omniva/schemas';
import { expect } from 'vitest';
import type { RawRequest, Visitor } from '../support/visitor.js';

/** The user whose data an intruder from another workspace tries to reach. */
export interface Victim {
  readonly user: Visitor;
  readonly session: CurrentSession;
}

/** How the intruder aims one endpoint at the victim's data. */
export interface Target extends RawRequest {
  /** What of the victim's, beyond their ids and email address, must never reach the intruder. */
  readonly secrets?: readonly string[];
  /** Fails when the intruder's call changed anything of the victim's. */
  readonly expectUnharmed?: () => Promise<void>;
}

/** Gives the victim whatever data the endpoint could reach, and says how to aim at it. */
export type IsolationCase = (victim: Victim) => Promise<Target>;

const INTRUDERS_PASSWORD = 'an intruder chose this password';

/** The victim's session survived: they are still signed in as themselves. */
const stillSignedIn =
  ({ user, session }: Victim) =>
  async (): Promise<void> => {
    const { data } = await user.api.GET('/v1/session');
    expect(data?.user.id).toBe(session.user.id);
  };

/**
 * The isolation test of every API endpoint, by operationId (ADR 0018). The isolation suite
 * fails while any endpoint lacks one, so a new endpoint cannot ship without it. Each case
 * aims the endpoint at the victim's data as precisely as an intruder could.
 */
export const ISOLATION_CASES: Readonly<Record<string, IsolationCase>> = {
  getHealth: () => Promise.resolve({}),

  // Signing up with the victim's address must neither reveal them nor touch their account.
  signUp: (victim) =>
    Promise.resolve({
      body: { email: victim.session.user.email, password: INTRUDERS_PASSWORD },
      expectUnharmed: stillSignedIn(victim),
    }),

  verifyEmail: (victim) =>
    Promise.resolve({ body: { token: randomUUID() }, expectUnharmed: stillSignedIn(victim) }),

  signIn: (victim) =>
    Promise.resolve({
      body: { email: victim.session.user.email, password: INTRUDERS_PASSWORD },
      expectUnharmed: stillSignedIn(victim),
    }),

  // Signing out ends only the caller's own session.
  signOut: (victim) => Promise.resolve({ expectUnharmed: stillSignedIn(victim) }),

  getCurrentSession: () => Promise.resolve({}),

  getWorkspace: ({ session }) =>
    Promise.resolve({ params: { workspaceId: session.personalWorkspace.id } }),
};
