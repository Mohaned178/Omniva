import { Module } from '@nestjs/common';
import { RecordsModule } from '../records/records.module.js';
import { PersonalWorkspaces } from './personal-workspaces.js';
import { WorkspaceMembers } from './workspace-members.js';
import { WorkspaceView } from './workspace-view.js';
import { WorkspacesController } from './workspaces.controller.js';

/** Workspaces & Membership (ADR 0002, ADR 0006). */
@Module({
  imports: [RecordsModule],
  controllers: [WorkspacesController],
  providers: [PersonalWorkspaces, WorkspaceMembers, WorkspaceView],
  exports: [PersonalWorkspaces, WorkspaceMembers],
})
export class WorkspacesModule {}
