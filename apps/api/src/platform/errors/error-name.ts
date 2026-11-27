/**
 * What kind of error it was, for a log line. Never the message, which can quote what a user
 * entered or an email address (CODING_STANDARDS §7).
 */
export function errorName(error: unknown): string {
  return error instanceof Error ? error.name : 'unknown error';
}
