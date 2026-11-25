import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import type { DatabaseTransaction } from '../../platform/database/database-transaction.js';
import { JobQueue } from '../../platform/jobs/job-queue.js';
import type { RecordChangeNotification } from './record-change-notification.js';
import { RECORD_CHANGE_QUEUE, declareRecordChangeQueue } from './record-change-queue.js';

/** API side: queues each record change's notification inside the change's own transaction. */
@Injectable()
export class RecordChangeAnnouncer implements OnApplicationBootstrap {
  constructor(private readonly jobs: JobQueue) {}

  async onApplicationBootstrap(): Promise<void> {
    await declareRecordChangeQueue(this.jobs);
  }

  async announce(
    transaction: DatabaseTransaction,
    notification: RecordChangeNotification,
  ): Promise<void> {
    await this.jobs.sendWithin(transaction, RECORD_CHANGE_QUEUE, notification);
  }
}
