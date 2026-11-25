import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PUBLIC_OPERATION_EXTENSION } from '../../src/identity/public.decorator.js';
import { OmnivaHarness } from './support/omniva-harness.js';
import { PASSWORD, signedInUser, verifiedUser } from './support/users.js';

const ANOTHER_SITE = 'https://another-site.example';

/** The only endpoints a visitor may use without a session (spec, D3). */
const PUBLIC_OPERATIONS = ['getHealth', 'signUp', 'verifyEmail', 'signIn'];

const HTTP_METHODS = ['get', 'put', 'post', 'patch', 'delete'] as const;

interface Operation {
  readonly method: (typeof HTTP_METHODS)[number];
  readonly path: string;
  readonly operationId: string;
  readonly isPublic: boolean;
}

describe('access to the API', () => {
  let omniva: OmnivaHarness;
  let operations: readonly Operation[];
  beforeAll(async () => {
    omniva = await OmnivaHarness.start();
    operations = everyOperation(omniva);
  });
  afterAll(async () => {
    await omniva.stop();
  });

  it('lets a visitor without a session reach only the public, sign-up and sign-in endpoints', () => {
    const publicOperations = operations.filter((operation) => operation.isPublic);

    expect(publicOperations.map((operation) => operation.operationId).sort()).toEqual(
      [...PUBLIC_OPERATIONS].sort(),
    );
  });

  it('refuses a visitor without a session at every other endpoint', async () => {
    const visitor = omniva.visitor();
    const privateOperations = operations.filter((operation) => !operation.isPublic);

    const outcomes = await Promise.all(
      privateOperations.map(async ({ method, path, operationId }) => {
        const response = await visitor.raw(method, path);
        return { operationId, status: response.status };
      }),
    );

    expect(privateOperations.length).toBeGreaterThan(0);
    expect(outcomes).toEqual(
      privateOperations.map(({ operationId }) => ({ operationId, status: 401 })),
    );
  });

  it('refuses a sign-in sent from another site', async () => {
    const email = await verifiedUser(omniva);
    const visitor = omniva.visitor();
    visitor.browseTo(ANOTHER_SITE);

    const { error, response } = await visitor.api.POST('/v1/auth/sign-in', {
      body: { email, password: PASSWORD },
    });

    expect(response.status).toBe(403);
    expect(error).toMatchObject({ code: 'UNTRUSTED_ORIGIN' });
    expect(visitor.hasCookies).toBe(false);
  });

  it('refuses a change a page on another site tries to make with a signed-in user’s cookie', async () => {
    const user = await signedInUser(omniva);
    user.browseTo(ANOTHER_SITE);

    const forged = await user.api.POST('/v1/auth/sign-out');
    const { response } = await user.api.GET('/v1/session');

    expect(forged.response.status).toBe(403);
    expect(response.status).toBe(200);
  });

  it('shows each signed-in user only their own personal workspace and Me', async () => {
    const [first, second] = await Promise.all([signedInUser(omniva), signedInUser(omniva)]);

    const [{ data: firstSession }, { data: secondSession }] = await Promise.all([
      first.api.GET('/v1/session'),
      second.api.GET('/v1/session'),
    ]);

    expect(firstSession?.user.id).not.toBe(secondSession?.user.id);
    expect(firstSession?.personalWorkspace.id).not.toBe(secondSession?.personalWorkspace.id);
    expect(firstSession?.personalWorkspace.mePersonId).not.toBe(
      secondSession?.personalWorkspace.mePersonId,
    );
  });
});

/** Every operation in the API's OpenAPI document, so a new endpoint is covered automatically. */
function everyOperation(omniva: OmnivaHarness): readonly Operation[] {
  return Object.entries(omniva.openApiDocument().paths).flatMap(([path, item]) =>
    HTTP_METHODS.flatMap((method) => {
      const operation = item[method];
      if (!operation) return [];
      return [
        {
          method,
          path,
          operationId: operation.operationId ?? `${method} ${path}`,
          isPublic: Reflect.get(operation, PUBLIC_OPERATION_EXTENSION) === true,
        },
      ];
    }),
  );
}
