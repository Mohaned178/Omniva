import { DomainError } from '../../platform/http/domain-error.js';

/** The user has not verified their email address yet. */
export class EmailNotVerified extends DomainError {
  readonly kind = 'forbidden';
  readonly code = 'EMAIL_NOT_VERIFIED';
}
