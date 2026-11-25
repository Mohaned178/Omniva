import type { LifeModule } from '@omniva/schemas';

/** Where a signed-in user lands. */
export const APP_HOME_PATH = '/app';

/** Where anyone without a session is sent. */
export const SIGN_IN_PATH = '/sign-in';

/** Where a visitor signs up. */
export const SIGN_UP_PATH = '/sign-up';

/** A module's list: the records whose home it is. */
export function modulePath(module: LifeModule): string {
  return `/app/${module}`;
}

/** The records put away from a module. */
export function archivedPath(module: LifeModule): string {
  return `${modulePath(module)}/archived`;
}

/** A record's own page. */
export function recordPath(recordId: string): string {
  return `/app/records/${encodeURIComponent(recordId)}`;
}

/** Where a record is edited. */
export function editRecordPath(recordId: string): string {
  return `${recordPath(recordId)}/edit`;
}

/** Where a new record of a Type is created. */
export function newRecordPath(typeKey: string): string {
  return `/app/records/new/${encodeURIComponent(typeKey)}`;
}
