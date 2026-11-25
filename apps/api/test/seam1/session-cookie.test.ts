import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OmnivaHarness } from './support/omniva-harness.js';
import { PASSWORD, verifiedUser } from './support/users.js';

/** The parent domain of the web app and API subdomains, as in a deployment. */
const SHARED_DOMAIN = 'omniva.test';

describe('the session cookie where the web app and the API are subdomains of one domain', () => {
  let omniva: OmnivaHarness;
  beforeAll(async () => {
    omniva = await OmnivaHarness.start({ environment: { COOKIE_DOMAIN: SHARED_DOMAIN } });
  });
  afterAll(async () => {
    await omniva.stop();
  });

  it('is scoped to the shared parent domain, so both subdomains receive it', async () => {
    const email = await verifiedUser(omniva);
    const visitor = omniva.visitor();

    await visitor.api.POST('/v1/auth/sign-in', { body: { email, password: PASSWORD } });

    const sessionCookie = visitor.setCookieHeaders.find((header) =>
      header.includes('omniva.session_token='),
    );
    expect(sessionCookie).toMatch(/; Domain=\.?omniva\.test(;|$)/i);
    expect(sessionCookie).toMatch(/; Secure/i);
  });
});

describe('a deployment that would share the session cookie over plain http', () => {
  it('refuses to start', async () => {
    const starting = OmnivaHarness.start({
      environment: { COOKIE_DOMAIN: SHARED_DOMAIN, API_PUBLIC_URL: 'http://api.omniva.test' },
    });

    await expect(starting).rejects.toThrow(/API_PUBLIC_URL/);
  });
});
