import type { PrismaClient } from '../../generated/prisma/client.js';
import type { DatabaseTransaction, TransactionScope } from './database-transaction.js';
import { RowLevelSecurityNotEnforced } from './row-level-security-not-enforced.js';

interface EnteredScope {
  readonly canBypassRowLevelSecurity: boolean | null;
}

/**
 * Extends the client with the Prisma client extension that carries the workspace into each
 * transaction (ADR 0009, ADR 0016): its first statement names the scope, so row-level
 * security can match rows against it. The settings end with the transaction.
 */
export function withWorkspaceScoping(client: PrismaClient) {
  return client.$extends({
    name: 'workspace-scoping',
    client: {
      $scopedTransaction<T>(
        scope: TransactionScope,
        work: (transaction: DatabaseTransaction) => Promise<T>,
      ): Promise<T> {
        return client.$transaction(async (transaction) => {
          await enterScope(transaction, scope);
          return work(transaction);
        });
      },
    },
  });
}

/**
 * Names the scope and, in the same round trip, fails closed if the connection's role could
 * bypass row-level security: a misconfigured deployment must refuse, never leak.
 */
async function enterScope(
  transaction: DatabaseTransaction,
  scope: TransactionScope,
): Promise<void> {
  const [entered] = await transaction.$queryRaw<EnteredScope[]>`
    SELECT set_config('app.workspace_id', ${scope.workspaceId ?? ''}, true) AS workspace_id,
           set_config('app.user_id', ${scope.userId ?? ''}, true) AS user_id,
           (SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname = current_user)
             AS "canBypassRowLevelSecurity"`;
  if (entered?.canBypassRowLevelSecurity !== false) {
    throw new RowLevelSecurityNotEnforced('The database role can bypass row-level security.');
  }
}
