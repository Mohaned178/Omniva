import { DomainError } from '../platform/http/domain-error.js';

export class SessionRequired extends DomainError {
  readonly kind = 'unauthenticated';
  readonly code = 'SESSION_REQUIRED';
}

export class InvalidCredentials extends DomainError {
  readonly kind = 'unauthenticated';
  readonly code = 'INVALID_CREDENTIALS';
}

export class EmailNotVerified extends DomainError {
  readonly kind = 'forbidden';
  readonly code = 'EMAIL_NOT_VERIFIED';
}

export class InvalidVerificationToken extends DomainError {
  readonly kind = 'invalid-input';
  readonly code = 'INVALID_VERIFICATION_TOKEN';
}
