/**
 * The database connection could bypass row-level security, so the second isolation layer
 * would silently be missing (ADR 0009). Nothing runs until the deployment is fixed.
 */
export class RowLevelSecurityNotEnforced extends Error {
  override readonly name = 'RowLevelSecurityNotEnforced';
}
