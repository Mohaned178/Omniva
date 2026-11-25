import { Module } from '@nestjs/common';
import { RecordsModule } from '../records/records.module.js';
import { PersonalWorkspaces } from './personal-workspaces.js';

/** Workspaces & Membership (ADR 0002, ADR 0006). */
@Module({
  imports: [RecordsModule],
  providers: [PersonalWorkspaces],
  exports: [PersonalWorkspaces],
})
export class WorkspacesModule {}
