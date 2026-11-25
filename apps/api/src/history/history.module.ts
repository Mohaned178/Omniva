import { Module } from '@nestjs/common';
import { ActivityTimeline } from './activity-timeline.js';

/** History: the Activity Timeline of changes in each workspace (ADR 0006, ADR 0008). */
@Module({
  providers: [ActivityTimeline],
  exports: [ActivityTimeline],
})
export class HistoryModule {}
