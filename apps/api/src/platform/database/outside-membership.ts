/**
 * A transaction was to act for a user inside a workspace they are not a member of. The
 * workspace gate should have refused first, so this is a mistake in the application, refused
 * rather than let through (ADR 0009).
 */
export class OutsideMembership extends Error {
  override readonly name = 'OutsideMembership';
}
