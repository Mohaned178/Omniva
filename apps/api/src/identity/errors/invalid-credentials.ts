import { DomainError } from '../../platform/http/domain-error.js';

/** The email address and password do not match a verified user. */
export class InvalidCredentials extends DomainError {
  readonly kind = 'unauthenticated';
  readonly code = 'INVALID_CREDENTIALS';
}
