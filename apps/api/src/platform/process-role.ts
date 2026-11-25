/** The API and the worker run the same codebase as two processes (ADR 0006). */
export type ProcessRole = 'api' | 'worker';

export const PROCESS_ROLE = Symbol('PROCESS_ROLE');
