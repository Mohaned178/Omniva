/**
 * The only source of the current time for domain and application code
 * (CODING_STANDARDS §6), so tests can move time forward. Also the DI token.
 */
export abstract class Clock {
  abstract now(): Date;
}
