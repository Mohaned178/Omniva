import type { DatabaseTransaction, TransactionScope } from './database-transaction.js';

/**
 * The workspace-scoped Prisma client (ADR 0009, ADR 0016, CODING_STANDARDS §6): every query
 * on a workspace-owned table runs inside one of its transactions, which PostgreSQL row-level
 * security limits to the scope's rows. PlatformModule provides the database client extended
 * with `withWorkspaceScoping` under this token; consumers see only this one method.
 */
export abstract class ScopedDatabase {
  abstract $scopedTransaction<T>(
    scope: TransactionScope,
    work: (transaction: DatabaseTransaction) => Promise<T>,
  ): Promise<T>;
}
