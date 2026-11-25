import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { AppConfig } from '../../platform/config/app-config.js';
import { JobQueue } from '../../platform/jobs/job-queue.js';
import {
  VERIFICATION_EMAIL_QUEUE,
  type VerificationEmailJob,
  declareVerificationEmailQueue,
} from './verification-email-queue.js';

/** The web page that receives the link and confirms the token with the API. */
const VERIFY_EMAIL_PATH = '/verify-email';

/**
 * Queues verification emails as durable jobs, so a mail outage delays them rather than losing
 * them (CODING_STANDARDS §8). The link opens the web app, which confirms the token with a
 * POST: a mail scanner that follows links cannot verify the address or start a session.
 */
@Injectable()
export class VerificationEmails implements OnApplicationBootstrap {
  constructor(
    private readonly jobs: JobQueue,
    private readonly config: AppConfig,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await declareVerificationEmailQueue(this.jobs);
  }

  async request(email: string, token: string): Promise<void> {
    const link = new URL(VERIFY_EMAIL_PATH, this.config.webOrigin);
    link.searchParams.set('token', token);
    const job: VerificationEmailJob = { to: email, verificationUrl: link.toString() };
    // Each token is one email: a repeated request for the same token queues nothing new.
    await this.jobs.send(VERIFICATION_EMAIL_QUEUE, job, { uniqueKey: token });
  }
}
