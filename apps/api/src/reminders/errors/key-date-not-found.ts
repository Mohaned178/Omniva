import { DomainError } from '../../platform/errors/domain-error.js';

/** The record has no such Key date on the day named, or there is no such record. */
export class KeyDateNotFound extends DomainError {
  readonly kind = 'not-found';
  readonly code = 'KEY_DATE_NOT_FOUND';
}
