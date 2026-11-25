/**
 * An endpoint names a workspace but the workspace gate does not guard it: a programming
 * mistake, refused as a server error rather than let through.
 */
export class WorkspaceGateMissing extends Error {
  override readonly name = 'WorkspaceGateMissing';
}
