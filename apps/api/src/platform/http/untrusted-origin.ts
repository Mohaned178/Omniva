import { DomainError } from './domain-error.js';

/** A request that changes data but did not come from the Omniva web app. */
export class UntrustedOrigin extends DomainError {
  readonly kind = 'forbidden';
  readonly code = 'UNTRUSTED_ORIGIN';
}
