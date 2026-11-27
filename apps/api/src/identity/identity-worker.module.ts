import { Module } from '@nestjs/common';
import { UserEmailAddresses } from './user-email-addresses.js';
import { VerificationEmailHandler } from './verification-email/verification-email-handler.js';

/** Identity & Access, worker side: sends verification emails and knows where to reach users. */
@Module({
  providers: [UserEmailAddresses, VerificationEmailHandler],
  exports: [UserEmailAddresses],
})
export class IdentityWorkerModule {}
