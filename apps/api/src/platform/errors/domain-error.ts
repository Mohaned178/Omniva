/**
 * What kind of failure a domain error is. The one exception filter maps each kind to an HTTP
 * status, so domain code never mentions HTTP (CODING_STANDARDS §4).
 */
export type DomainErrorKind =
  'invalid-input' | 'unauthenticated' | 'forbidden' | 'not-found' | 'conflict';

/** A typed failure with a stable, machine-readable code, such as `SESSION_REQUIRED`. */
export abstract class DomainError extends Error {
  abstract readonly kind: DomainErrorKind;
  abstract readonly code: string;
}
