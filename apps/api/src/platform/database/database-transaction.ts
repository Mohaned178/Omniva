import type { Prisma } from '../../generated/prisma/client.js';

/** A Prisma interactive transaction, handed between capability modules for one atomic change. */
export type DatabaseTransaction = Prisma.TransactionClient;

/**
 * Which rows a scoped transaction may reach under row-level security (ADR 0009). A request
 * inside a workspace passes the gate's WorkspaceAccess, which carries both.
 */
export interface TransactionScope {
  /** The workspace whose rows the transaction may read and write. */
  readonly workspaceId?: string;
  /** The signed-in user, whose own memberships the transaction may read. */
  readonly userId?: string;
}
