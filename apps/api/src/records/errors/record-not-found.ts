import { DomainError } from '../../platform/errors/domain-error.js';

/**
 * No record with this id in the workspace. A record in another workspace looks the same, so
 * nobody can learn which records exist (ADR 0009).
 */
export class RecordNotFound extends DomainError {
  readonly kind = 'not-found';
  readonly code = 'RECORD_NOT_FOUND';
}
