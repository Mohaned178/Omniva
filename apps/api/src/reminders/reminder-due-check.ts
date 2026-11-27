import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { AppConfig } from '../platform/config/app-config.js';
import { errorName } from '../platform/errors/error-name.js';
import { ReminderDeliveries } from './reminder-deliveries.js';

/**
 * The worker's check for due reminders, every minute (ADR 0012). It needs no durable job of
 * its own: what is due lives in the schedule, so a check missed while the worker was down is
 * made up by the first check after it starts. Checks run one at a time, and stopping the
 * worker waits for the one in progress, so no send is cut off halfway.
 */
@Injectable()
export class ReminderDueCheck implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(ReminderDueCheck.name);
  private latest: Promise<void> = Promise.resolve();
  private timer: NodeJS.Timeout | undefined;
  private isStopping = false;

  constructor(
    private readonly deliveries: ReminderDeliveries,
    private readonly config: AppConfig,
  ) {}

  onApplicationBootstrap(): void {
    void this.runNow().then(() => {
      this.scheduleNext();
    });
  }

  /** Runs a check once the one in progress, if any, has finished. */
  runNow(): Promise<void> {
    this.latest = this.latest.then(() => this.check());
    return this.latest;
  }

  async onModuleDestroy(): Promise<void> {
    this.isStopping = true;
    clearTimeout(this.timer);
    await this.latest;
  }

  private scheduleNext(): void {
    if (this.isStopping) return;
    this.timer = setTimeout(() => {
      void this.runNow().then(() => {
        this.scheduleNext();
      });
    }, this.config.reminderCheckIntervalMs);
  }

  private async check(): Promise<void> {
    if (this.isStopping) return;
    try {
      await this.deliveries.deliverDue();
    } catch (error) {
      // The next check tries again; nothing is lost, as the schedule still holds it.
      this.logger.error(`The reminder check failed: ${errorName(error)}`);
    }
  }
}
