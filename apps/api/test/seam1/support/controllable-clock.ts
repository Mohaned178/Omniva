import { Clock } from '../../../src/platform/clock/clock.js';

/** A clock that only moves when a test moves it. The API and the worker share one. */
export class ControllableClock extends Clock {
  private current: Date;

  constructor(start: Date) {
    super();
    this.current = start;
  }

  now(): Date {
    return new Date(this.current);
  }

  setTo(instant: Date): void {
    this.current = new Date(instant);
  }

  advanceBy(milliseconds: number): void {
    this.current = new Date(this.current.getTime() + milliseconds);
  }
}
