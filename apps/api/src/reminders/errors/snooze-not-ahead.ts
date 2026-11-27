import { DomainError } from '../../platform/errors/domain-error.js';

/** A snooze must end on a day after today, or it would not put anything off. */
export class SnoozeNotAhead extends DomainError {
  readonly kind = 'invalid-input';
  readonly code = 'SNOOZE_NOT_AHEAD';
}
