import { DomainError } from '../../platform/errors/domain-error.js';

/** The user has not verified their email address yet. */
export class EmailNotVerified extends DomainError {
  readonly kind = 'forbidden';
  readonly code = 'EMAIL_NOT_VERIFIED';
}
