import { Module } from '@nestjs/common';
import { PersonRecords } from './person-records.js';

/** Records core: every record and its anatomy (ADR 0006, ADR 0011). */
@Module({
  providers: [PersonRecords],
  exports: [PersonRecords],
})
export class RecordsModule {}
