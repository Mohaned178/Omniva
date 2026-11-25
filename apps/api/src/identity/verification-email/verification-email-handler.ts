import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { EmailSender } from '../../platform/email/email-sender.js';
import { JobQueue } from '../../platform/jobs/job-queue.js';
import {
  VERIFICATION_EMAIL_QUEUE,
  VerificationEmailJobSchema,
  declareVerificationEmailQueue,
} from './verification-email-queue.js';

const POLLING_INTERVAL_SECONDS = 1;
const SUBJECT = 'Verify your email address for Omniva';

/** Worker side: sends each queued verification email. */
@Injectable()
export class VerificationEmailHandler implements OnApplicationBootstrap {
  constructor(
    private readonly jobs: JobQueue,
    private readonly email: EmailSender,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await declareVerificationEmailQueue(this.jobs);
    await this.jobs.work(
      VERIFICATION_EMAIL_QUEUE,
      { pollingIntervalSeconds: POLLING_INTERVAL_SECONDS },
      async (data) => {
        const { to, verificationUrl } = VerificationEmailJobSchema.parse(data);
        await this.email.send({ to, subject: SUBJECT, text: messageText(verificationUrl) });
      },
    );
  }
}

function messageText(verificationUrl: string): string {
  return [
    'Welcome to Omniva.',
    '',
    'Open this link to verify your email address and sign in:',
    verificationUrl,
    '',
    'The link works for 24 hours. If you did not sign up for Omniva, you can ignore this email.',
  ].join('\n');
}
