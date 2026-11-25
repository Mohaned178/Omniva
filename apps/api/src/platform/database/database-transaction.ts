import type { Prisma } from '../../generated/prisma/client.js';

/** A Prisma interactive transaction, handed between capability modules for one atomic change. */
export type DatabaseTransaction = Prisma.TransactionClient;

export interface TransactionScope {
  /** The workspace whose rows the transaction may read and write. */
  readonly workspaceId?: string;
  /** The signed-in user, whose memberships the transaction may read. */
  readonly userId?: string;
}

/**
 * Names the workspace and user for the rest of the transaction, so PostgreSQL row-level
 * security can match rows against them (ADR 0009). The settings end with the transaction.
 */
export async function scopeTransaction(
  transaction: DatabaseTransaction,
  scope: TransactionScope,
): Promise<void> {
  await transaction.$executeRaw`
    SELECT set_config('app.workspace_id', ${scope.workspaceId ?? ''}, true),
           set_config('app.user_id', ${scope.userId ?? ''}, true)`;
}
