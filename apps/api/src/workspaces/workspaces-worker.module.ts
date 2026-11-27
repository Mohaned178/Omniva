import { Module } from '@nestjs/common';
import { WorkspaceMembers } from './workspace-members.js';

/** Workspaces & Membership, worker side: who belongs to each workspace. */
@Module({
  providers: [WorkspaceMembers],
  exports: [WorkspaceMembers],
})
export class WorkspacesWorkerModule {}
