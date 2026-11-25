import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OmnivaHarness } from './support/omniva-harness.js';
import { TEST_WEB_ORIGIN } from './support/test-environment.js';
import { PASSWORD, newEmail, verificationTokenFor, verifiedUser } from './support/users.js';

/** Workspace and record identifiers are random UUIDs (CODING_STANDARDS �6). */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('sign-up, email verification and sign-in', () => {
  let omniva: OmnivaHarness;
  beforeAll(async () => {
    omniva = await OmnivaHarness.start();
  });
  afterAll(async () => {
    await omniva.stop();
  });

  it('sends a new user a link to verify their email address', async () => {
    const email = newEmail();

    const { response } = await omniva
      .visitor()
      .api.POST('/v1/auth/sign-up', { body: { email, password: PASSWORD } });

    expect(response.status).toBe(202);
    const message = await omniva.mail.waitForMessageTo(email);
    expect(message.subject).toBe('Verify your email address for Omniva');
    expect(message.text).toMatch(new RegExp(`${TEST_WEB_ORIGIN}/verify-email\\?token=\\S+`));
  });

  it('refuses to sign in until the email address is verified, and sends a fresh link', async () => {
    const email = newEmail();
    const visitor = omniva.visitor();
    await visitor.api.POST('/v1/auth/sign-up', { body: { email, password: PASSWORD } });
    await omniva.mail.waitForMessageTo(email);

    const { error, response } = await visitor.api.POST('/v1/auth/sign-in', {
      body: { email, password: PASSWORD },
    });

    expect(response.status).toBe(403);
    expect(error).toMatchObject({ code: 'EMAIL_NOT_VERIFIED' });
    expect(visitor.hasCookies).toBe(false);
    await expect.poll(async () => (await omniva.mail.messagesTo(email)).length).toBe(2);
  });

  it('signs a user in once they verify, into their own personal workspace as its Owner, with a Me record', async () => {
    const email = newEmail();
    const visitor = omniva.visitor();
    await visitor.api.POST('/v1/auth/sign-up', { body: { email, password: PASSWORD } });
    const token = await verificationTokenFor(omniva, email);

    const verified = await visitor.api.POST('/v1/auth/email-verification', { body: { token } });
    const { data: session } = await visitor.api.GET('/v1/session');

    expect(verified.response.status).toBe(204);
    expect(session?.user.email).toBe(email);
    expect(session?.personalWorkspace.role).toBe('owner');
    expect(session?.personalWorkspace.id).toMatch(UUID);
    expect(session?.personalWorkspace.mePersonId).toMatch(UUID);
  });

  it('refuses a verification link that is not genuine', async () => {
    const visitor = omniva.visitor();

    const { error, response } = await visitor.api.POST('/v1/auth/email-verification', {
      body: { token: 'not-a-real-token' },
    });

    expect(response.status).toBe(400);
    expect(error).toMatchObject({ code: 'INVALID_VERIFICATION_TOKEN' });
    expect(visitor.hasCookies).toBe(false);
  });

  it('signs a verified user in with their email address and password', async () => {
    const email = await verifiedUser(omniva);
    const visitor = omniva.visitor();

    const { response } = await visitor.api.POST('/v1/auth/sign-in', {
      body: { email, password: PASSWORD },
    });
    const { data: session } = await visitor.api.GET('/v1/session');

    expect(response.status).toBe(204);
    expect(session?.user.email).toBe(email);
  });

  it('keeps the session in a Secure, HTTP-only, same-site cookie', async () => {
    const email = await verifiedUser(omniva);
    const visitor = omniva.visitor();

    await visitor.api.POST('/v1/auth/sign-in', { body: { email, password: PASSWORD } });

    const sessionCookie = visitor.setCookieHeaders.find((header) =>
      header.includes('omniva.session_token='),
    );
    expect(sessionCookie).toMatch(/; HttpOnly/i);
    expect(sessionCookie).toMatch(/; Secure/i);
    expect(sessionCookie).toMatch(/; SameSite=Lax/i);
  });

  it('refuses a wrong password without saying whether the address is registered', async () => {
    const email = await verifiedUser(omniva);
    const visitor = omniva.visitor();

    const wrongPassword = await visitor.api.POST('/v1/auth/sign-in', {
      body: { email, password: 'not the password at all' },
    });
    const unknownAddress = await visitor.api.POST('/v1/auth/sign-in', {
      body: { email: newEmail(), password: PASSWORD },
    });

    expect(wrongPassword.response.status).toBe(401);
    expect(wrongPassword.error).toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(unknownAddress.error).toEqual(wrongPassword.error);
    expect(visitor.hasCookies).toBe(false);
  });

  it('ends the session on sign-out', async () => {
    const email = await verifiedUser(omniva);
    const visitor = omniva.visitor();
    await visitor.api.POST('/v1/auth/sign-in', { body: { email, password: PASSWORD } });

    const signedOut = await visitor.api.POST('/v1/auth/sign-out');
    const { error, response } = await visitor.api.GET('/v1/session');

    expect(signedOut.response.status).toBe(204);
    expect(response.status).toBe(401);
    expect(error).toMatchObject({ code: 'SESSION_REQUIRED' });
  });

  it('answers a second sign-up for a registered address exactly like a new one, and changes nothing', async () => {
    const email = await verifiedUser(omniva);

    const { response } = await omniva
      .visitor()
      .api.POST('/v1/auth/sign-up', { body: { email, password: 'someone else entirely' } });
    const original = await omniva
      .visitor()
      .api.POST('/v1/auth/sign-in', { body: { email, password: PASSWORD } });

    expect(response.status).toBe(202);
    expect(original.response.status).toBe(204);
  });
});
