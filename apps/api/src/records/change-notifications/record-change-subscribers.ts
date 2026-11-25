import { Injectable } from '@nestjs/common';
import type { RecordChangeNotification } from './record-change-notification.js';

/**
 * Reacts to one record change. A notification can arrive more than once when a delivery is
 * retried, so every subscriber must be idempotent (CODING_STANDARDS §8).
 */
export type RecordChangeSubscriber = (notification: RecordChangeNotification) => Promise<void>;

/**
 * Worker side: the modules that react to record changes, such as search and reminders,
 * subscribe here at start-up, so Records core never needs to know them (CODING_STANDARDS §3).
 */
@Injectable()
export class RecordChangeSubscribers {
  private readonly subscribers: RecordChangeSubscriber[] = [];

  subscribe(subscriber: RecordChangeSubscriber): void {
    this.subscribers.push(subscriber);
  }

  /** Passes the notification to every subscriber; if one fails, the whole delivery is retried. */
  async deliver(notification: RecordChangeNotification): Promise<void> {
    for (const subscriber of this.subscribers) await subscriber(notification);
  }
}
