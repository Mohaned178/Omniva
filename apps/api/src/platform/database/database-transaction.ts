import type { Prisma } from '../../generated/prisma/client.js';

/** A Prisma interactive transaction, handed between capability modules for one atomic change. */
export type DatabaseTransaction = Prisma.TransactionClient;

/**
 * Omniva's own work across every workspace (ADR 0021). A table this work needs carries a
 * read-only policy naming it, and no other table does.
 */
export type CrossWorkspaceTask = 'reminders.find-due';

/**
 * Which rows a scoped transaction may reach under row-level security (ADR 0009). A request
 * inside a workspace passes the gate's WorkspaceAccess, which carries both.
 */
export interface TransactionScope {
  /** The workspace whose rows the transaction may read and write. */
  readonly workspaceId?: string;
  /** The signed-in user, whose own memberships the transaction may read. */
  readonly userId?: string;
  /** Omniva's own task across workspaces, which reads only what its policies allow. */
  readonly task?: CrossWorkspaceTask;
}

export interface TransactionOptions {
  /**
   * How long the transaction may run before it is rolled back. The default suits a few
   * queries; work that waits on another service inside the transaction needs longer.
   */
  readonly timeoutMs?: number;
}
