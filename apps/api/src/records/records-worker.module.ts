import { Module } from '@nestjs/common';
import { RecordChangeDispatcher } from './change-notifications/record-change-dispatcher.js';
import { RecordChangeSubscribers } from './change-notifications/record-change-subscribers.js';
import { KeyDateReader } from './key-dates/key-date-reader.js';

/**
 * Records core, worker side: passes each durable change notification on to the modules that
 * subscribe to record changes (ADR 0008), and lets them read the Key-date collection.
 */
@Module({
  providers: [RecordChangeSubscribers, RecordChangeDispatcher, KeyDateReader],
  exports: [RecordChangeSubscribers, KeyDateReader],
})
export class RecordsWorkerModule {}
