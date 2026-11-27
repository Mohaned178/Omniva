import type { PrismaClient } from '../../generated/prisma/client.js';
import type {
  DatabaseTransaction,
  TransactionOptions,
  TransactionScope,
} from './database-transaction.js';
import { OutsideMembership } from './outside-membership.js';
import { RowLevelSecurityNotEnforced } from './row-level-security-not-enforced.js';

interface EnteredScope {
  readonly canBypassRowLevelSecurity: boolean | null;
}

interface Membership {
  readonly isMember: boolean;
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
        options: TransactionOptions = {},
      ): Promise<T> {
        return client.$transaction(
          async (transaction) => {
            await enterScope(transaction, scope);
            await confirmMembership(transaction, scope);
            return work(transaction);
          },
          options.timeoutMs === undefined ? {} : { timeout: options.timeoutMs },
        );
      },
    },
  });
}

/**
 * Names the scope and, in the same round trip, fails closed if the connection's role could
 * bypass row-level security: a misconfigured deployment must refuse, never leak. A task across
 * workspaces names no workspace, so only the policies that name its task let it see rows.
 */
async function enterScope(
  transaction: DatabaseTransaction,
  scope: TransactionScope,
): Promise<void> {
  const [entered] = await transaction.$queryRaw<EnteredScope[]>`
    SELECT set_config('app.workspace_id', ${scope.workspaceId ?? ''}, true) AS workspace_id,
           set_config('app.user_id', ${scope.userId ?? ''}, true) AS user_id,
           set_config('app.task', ${scope.task ?? ''}, true) AS task,
           (SELECT rolsuper OR rolbypassrls FROM pg_roles WHERE rolname = current_user)
             AS "canBypassRowLevelSecurity"`;
  if (entered?.canBypassRowLevelSecurity !== false) {
    throw new RowLevelSecurityNotEnforced('The database role can bypass row-level security.');
  }
}

/**
 * A transaction acting for a user inside a workspace runs only while that user is a member
 * of it. The gate checked this already; checking again here keeps the database layer from
 * trusting a workspace the gate never verified, such as one taken from a request body.
 * Row-level security has to see the scope first, so this is a second statement.
 */
async function confirmMembership(
  transaction: DatabaseTransaction,
  { workspaceId, userId }: TransactionScope,
): Promise<void> {
  if (workspaceId === undefined || userId === undefined) return;
  const [membership] = await transaction.$queryRaw<Membership[]>`
    SELECT EXISTS (
      SELECT 1 FROM member WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
    ) AS "isMember"`;
  if (membership?.isMember !== true) {
    throw new OutsideMembership('The user is not a member of the workspace.');
  }
}
