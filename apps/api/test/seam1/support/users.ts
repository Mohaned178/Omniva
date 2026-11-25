import { randomUUID } from 'node:crypto';
import type { OmnivaHarness } from './omniva-harness.js';
import type { Visitor } from './visitor.js';

export const PASSWORD = 'correct horse battery staple';

/** An address nobody has used, so tests never collide in the shared database. */
export function newEmail(): string {
  return `${randomUUID()}@example.test`;
}

/** The token from the link in the newest verification email to the address. */
export async function verificationTokenFor(omniva: OmnivaHarness, email: string): Promise<string> {
  const { text } = await omniva.mail.waitForMessageTo(email);
  const link = /https?:\/\/\S+\/verify-email\?token=\S+/.exec(text)?.[0];
  if (!link) throw new Error('The verification email has no link');
  return new URL(link).searchParams.get('token') ?? '';
}

/** Signs up and verifies, returning the email address of a user who can now sign in. */
export async function verifiedUser(omniva: OmnivaHarness): Promise<string> {
  const email = newEmail();
  const visitor = omniva.visitor();
  await visitor.api.POST('/v1/auth/sign-up', { body: { email, password: PASSWORD } });
  const token = await verificationTokenFor(omniva, email);
  await visitor.api.POST('/v1/auth/email-verification', { body: { token } });
  return email;
}

/** A verified user, signed in through the web app. */
export async function signedInUser(omniva: OmnivaHarness): Promise<Visitor> {
  const email = await verifiedUser(omniva);
  const visitor = omniva.visitor();
  await visitor.api.POST('/v1/auth/sign-in', { body: { email, password: PASSWORD } });
  return visitor;
}
