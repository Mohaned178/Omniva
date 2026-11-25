import { Module } from '@nestjs/common';
import { VerificationEmailHandler } from './verification-email/verification-email-handler.js';

/** Identity & Access, worker side: sends verification emails. */
@Module({
  providers: [VerificationEmailHandler],
})
export class IdentityWorkerModule {}
