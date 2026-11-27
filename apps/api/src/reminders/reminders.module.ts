import { Module } from '@nestjs/common';
import { RecordsModule } from '../records/records.module.js';
import { AttentionList } from './attention-list.js';
import { AttentionListController } from './attention-list.controller.js';
import { ReminderSchedule } from './reminder-schedule.js';
import { ReminderStatusController } from './reminder-status.controller.js';
import { ReminderStatuses } from './reminder-statuses.js';

/**
 * Scheduling & Reminders, API side (ADR 0006): the attention list, and what the user does
 * about their reminders.
 */
@Module({
  imports: [RecordsModule],
  controllers: [AttentionListController, ReminderStatusController],
  providers: [AttentionList, ReminderSchedule, ReminderStatuses],
})
export class RemindersModule {}
