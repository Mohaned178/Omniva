import { DomainError } from '../../platform/errors/domain-error.js';

/**
 * A date looks like a typo (a year like 2205, an expiry before its issue date). Nothing is
 * saved until the user confirms the dates as given. The message names no date (CODING_STANDARDS §7).
 */
export class ImplausibleDates extends DomainError {
  readonly kind = 'conflict';
  readonly code = 'IMPLAUSIBLE_DATES';
}
