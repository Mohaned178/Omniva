import { Module } from '@nestjs/common';
import { RecordChangeDispatcher } from './change-notifications/record-change-dispatcher.js';
import { RecordChangeSubscribers } from './change-notifications/record-change-subscribers.js';

/**
 * Records core, worker side: passes each durable change notification on to the modules that
 * subscribe to record changes (ADR 0008).
 */
@Module({
  providers: [RecordChangeSubscribers, RecordChangeDispatcher],
  exports: [RecordChangeSubscribers],
})
export class RecordsWorkerModule {}
