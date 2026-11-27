import { Module, type OnModuleInit } from '@nestjs/common';
import { IdentityWorkerModule } from '../identity/identity-worker.module.js';
import { RecordChangeSubscribers } from '../records/change-notifications/record-change-subscribers.js';
import { RecordsWorkerModule } from '../records/records-worker.module.js';
import { WorkspacesWorkerModule } from '../workspaces/workspaces-worker.module.js';
import { ReminderDeliveries } from './reminder-deliveries.js';
import { ReminderDueCheck } from './reminder-due-check.js';
import { ReminderEmails } from './reminder-emails.js';
import { ReminderSchedule } from './reminder-schedule.js';

/**
 * Scheduling & Reminders, worker side (ADR 0006, ADR 0012): keeps each record's due notices in
 * step with its changes, and delivers them as they come due.
 */
@Module({
  imports: [RecordsWorkerModule, WorkspacesWorkerModule, IdentityWorkerModule],
  providers: [ReminderSchedule, ReminderDeliveries, ReminderEmails, ReminderDueCheck],
})
export class RemindersWorkerModule implements OnModuleInit {
  constructor(
    private readonly recordChanges: RecordChangeSubscribers,
    private readonly schedule: ReminderSchedule,
  ) {}

  /** A change notification can arrive twice; rebuilding the record's schedule is safe to repeat. */
  onModuleInit(): void {
    this.recordChanges.subscribe(({ workspaceId, recordId }) =>
      this.schedule.rebuildFor(workspaceId, recordId),
    );
  }
}
