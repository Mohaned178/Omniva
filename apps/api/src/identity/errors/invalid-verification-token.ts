import { DomainError } from '../../platform/errors/domain-error.js';

/** The email verification token is not genuine or has expired. */
export class InvalidVerificationToken extends DomainError {
  readonly kind = 'invalid-input';
  readonly code = 'INVALID_VERIFICATION_TOKEN';
}
