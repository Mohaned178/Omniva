import { DomainError } from '../../platform/errors/domain-error.js';

/** The request names a Type that does not exist. */
export class UnknownType extends DomainError {
  readonly kind = 'invalid-input';
  readonly code = 'UNKNOWN_TYPE';
}
