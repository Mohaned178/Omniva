import { Module } from '@nestjs/common';
import { HistoryModule } from '../history/history.module.js';
import { RecordChangeAnnouncer } from './change-notifications/record-change-announcer.js';
import { PersonRecords } from './person-records.js';
import { RecordChangeLog } from './record-change-log.js';
import { KeyDateAttention } from './key-dates/key-date-attention.js';
import { KeyDateCollection } from './key-dates/key-date-collection.js';
import { KeyDatesController } from './key-dates/key-dates.controller.js';
import { RecordChanges } from './record-changes.js';
import { RecordLibrary } from './record-library.js';
import { RecordsController } from './records.controller.js';
import { TypeCatalog } from './type-catalog.js';
import { TypesController } from './types.controller.js';

/** Records core: every record and its anatomy (ADR 0006, ADR 0011). */
@Module({
  imports: [HistoryModule],
  controllers: [RecordsController, TypesController, KeyDatesController],
  providers: [
    KeyDateAttention,
    KeyDateCollection,
    PersonRecords,
    RecordChangeAnnouncer,
    RecordChangeLog,
    RecordChanges,
    RecordLibrary,
    TypeCatalog,
  ],
  exports: [PersonRecords, TypeCatalog],
})
export class RecordsModule {}
