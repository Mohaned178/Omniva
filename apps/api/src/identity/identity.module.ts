import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TrustedOriginGuard } from '../platform/http/trusted-origin.guard.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';
import { AuthController } from './auth.controller.js';
import { Authentication } from './authentication.js';
import { CurrentSessionView } from './current-session-view.js';
import { SessionController } from './session.controller.js';
import { SessionGuard } from './session.guard.js';
import { VerificationEmails } from './verification-email/verification-emails.js';
import { WorkspaceAccessGuard } from './workspace-access.guard.js';

/**
 * Identity & Access, API side (ADR 0006). Its guards apply to every endpoint, in this order:
 * a request that changes anything must come from the web app, then it must carry a valid
 * session unless the endpoint is public, then a request that names a workspace must come from
 * a member of it whose role allows the endpoint.
 */
@Module({
  imports: [WorkspacesModule],
  controllers: [AuthController, SessionController],
  providers: [
    Authentication,
    CurrentSessionView,
    VerificationEmails,
    { provide: APP_GUARD, useClass: TrustedOriginGuard },
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: WorkspaceAccessGuard },
  ],
})
export class IdentityModule {}
