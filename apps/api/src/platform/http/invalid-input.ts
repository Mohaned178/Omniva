import { DomainError } from '../errors/domain-error.js';

/** A request body that does not match its shared schema. */
export class InvalidInput extends DomainError {
  readonly kind = 'invalid-input';
  readonly code = 'INVALID_INPUT';
}
