import { Module, type OnModuleInit } from '@nestjs/common';
import type { RecordChangeNotification } from '../../../src/records/change-notifications/record-change-notification.js';
import { RecordChangeSubscribers } from '../../../src/records/change-notifications/record-change-subscribers.js';
import { RecordsWorkerModule } from '../../../src/records/records-worker.module.js';

/** Every change notification the worker has passed on, in the order it passed them. */
export const receivedRecordChanges: RecordChangeNotification[] = [];

/**
 * Stands in for the modules later tickets add that react to record changes (search,
 * reminders, Insights), so delivery is tested now. Mounted only in the test harness's worker.
 */
@Module({ imports: [RecordsWorkerModule] })
export class RecordChangeProbeModule implements OnModuleInit {
  constructor(private readonly subscribers: RecordChangeSubscribers) {}

  onModuleInit(): void {
    this.subscribers.subscribe((notification) => {
      receivedRecordChanges.push(notification);
      return Promise.resolve();
    });
  }
}
