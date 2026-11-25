import { DomainError } from '../../platform/http/domain-error.js';

/** No valid session came with the request. */
export class SessionRequired extends DomainError {
  readonly kind = 'unauthenticated';
  readonly code = 'SESSION_REQUIRED';
}
