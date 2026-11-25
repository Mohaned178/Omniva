import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { JobQueue } from '../../platform/jobs/job-queue.js';
import { RecordChangeNotificationSchema } from './record-change-notification.js';
import { RECORD_CHANGE_QUEUE, declareRecordChangeQueue } from './record-change-queue.js';
import { RecordChangeSubscribers } from './record-change-subscribers.js';

const POLLING_INTERVAL_SECONDS = 1;
/**
 * Every record change, including each Me made at sign-up, queues a notification, so a backlog
 * builds whenever the worker was down; taking one per poll would drain it at one a second.
 */
const BATCH_SIZE = 50;

/**
 * Worker side: takes each queued change notification and passes it to the subscribers. It
 * starts after every module has initialised, so all subscribers are in place by then.
 */
@Injectable()
export class RecordChangeDispatcher implements OnApplicationBootstrap {
  constructor(
    private readonly jobs: JobQueue,
    private readonly subscribers: RecordChangeSubscribers,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await declareRecordChangeQueue(this.jobs);
    await this.jobs.work(
      RECORD_CHANGE_QUEUE,
      { pollingIntervalSeconds: POLLING_INTERVAL_SECONDS, batchSize: BATCH_SIZE },
      async (data) => {
        await this.subscribers.deliver(RecordChangeNotificationSchema.parse(data));
      },
    );
  }
}
