import { randomUUID } from 'node:crypto';
import type { ApiError } from '@omniva/schemas';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GATE_PROBE_PATH, GateProbeModule } from './support/gate-probe.module.js';
import { OmnivaHarness } from './support/omniva-harness.js';
import { sharedWorkspaceWith } from './support/shared-workspace.js';
import { currentSessionOf, signedInUser } from './support/users.js';
import type { Visitor } from './support/visitor.js';

/**
 * The application gate (spec, D3; ADR 0009): every request that names a workspace is let
 * through only for a member of it, whose role allows what the endpoint does.
 */
describe('the workspace gate', () => {
  let omniva: OmnivaHarness;
  beforeAll(async () => {
    omniva = await OmnivaHarness.start({ apiModules: [GateProbeModule] });
  });
  afterAll(async () => {
    await omniva.stop();
  });

  const getWorkspace = (user: Visitor, workspaceId: string) =>
    user.api.GET('/v1/workspaces/{workspaceId}', { params: { path: { workspaceId } } });

  it('shows a user their personal workspace, where they are the Owner', async () => {
    const user = await signedInUser(omniva);
    const { personalWorkspace } = await currentSessionOf(user);

    const { data } = await getWorkspace(user, personalWorkspace.id);

    expect(data).toEqual({ id: personalWorkspace.id, kind: 'personal', role: 'owner' });
  });

  it('shows each member of a shared workspace their own role in it', async () => {
    const [owner, editor, viewer] = await Promise.all([
      signedInUser(omniva),
      signedInUser(omniva),
      signedInUser(omniva),
    ]);
    const workspaceId = await sharedWorkspaceWith([
      { userId: (await currentSessionOf(owner)).user.id, role: 'owner' },
      { userId: (await currentSessionOf(editor)).user.id, role: 'editor' },
      { userId: (await currentSessionOf(viewer)).user.id, role: 'viewer' },
    ]);

    const roles = await Promise.all(
      [owner, editor, viewer].map(async (member) => (await getWorkspace(member, workspaceId)).data),
    );

    expect(roles).toEqual([
      { id: workspaceId, kind: 'shared', role: 'owner' },
      { id: workspaceId, kind: 'shared', role: 'editor' },
      { id: workspaceId, kind: 'shared', role: 'viewer' },
    ]);
  });

  it('refuses a user who is not a member exactly as if the workspace did not exist', async () => {
    const [owner, stranger] = await Promise.all([signedInUser(omniva), signedInUser(omniva)]);
    const { personalWorkspace } = await currentSessionOf(owner);

    const someoneElses = await getWorkspace(stranger, personalWorkspace.id);
    const nonexistent = await getWorkspace(stranger, randomUUID());

    expect(someoneElses.response.status).toBe(404);
    expect(someoneElses.error).toMatchObject({ code: 'WORKSPACE_NOT_FOUND' });
    expect(someoneElses.error).toEqual(nonexistent.error);
    expect(nonexistent.response.status).toBe(404);
  });

  it('lets a member do only what their role allows', async () => {
    const [owner, editor, viewer] = await Promise.all([
      signedInUser(omniva),
      signedInUser(omniva),
      signedInUser(omniva),
    ]);
    const workspaceId = await sharedWorkspaceWith([
      { userId: (await currentSessionOf(owner)).user.id, role: 'owner' },
      { userId: (await currentSessionOf(editor)).user.id, role: 'editor' },
      { userId: (await currentSessionOf(viewer)).user.id, role: 'viewer' },
    ]);
    const attempt = async (member: Visitor, action: 'editor-action' | 'owner-action') => {
      const response = await member.raw('post', `${GATE_PROBE_PATH}/${action}`, {
        params: { workspaceId },
      });
      return response.status === 204 ? 'done' : ((await response.json()) as ApiError).code;
    };

    const outcomes = {
      owner: [await attempt(owner, 'editor-action'), await attempt(owner, 'owner-action')],
      editor: [await attempt(editor, 'editor-action'), await attempt(editor, 'owner-action')],
      viewer: [await attempt(viewer, 'editor-action'), await attempt(viewer, 'owner-action')],
    };

    expect(outcomes).toEqual({
      owner: ['done', 'done'],
      editor: ['done', 'WORKSPACE_ACCESS_DENIED'],
      viewer: ['WORKSPACE_ACCESS_DENIED', 'WORKSPACE_ACCESS_DENIED'],
    });
  });

  it('refuses an endpoint that names a workspace but declares no role, even to its Owner', async () => {
    const user = await signedInUser(omniva);
    const { personalWorkspace } = await currentSessionOf(user);

    const response = await user.raw('get', `${GATE_PROBE_PATH}/ungated`, {
      params: { workspaceId: personalWorkspace.id },
    });

    expect(response.status).toBe(500);
  });
});
