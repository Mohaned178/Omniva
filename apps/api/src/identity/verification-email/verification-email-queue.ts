import { z } from 'zod';
import type { JobQueue, QueuePolicy } from '../../platform/jobs/job-queue.js';

export const VERIFICATION_EMAIL_QUEUE = 'identity.verification-email';

export const VerificationEmailJobSchema = z.object({
  to: z.email(),
  verificationUrl: z.url(),
});
export type VerificationEmailJob = z.infer<typeof VerificationEmailJobSchema>;

/** An email provider can be briefly unavailable; a few retries ride that out. */
const VERIFICATION_EMAIL_RETRY_LIMIT = 5;
const VERIFICATION_EMAIL_EXPIRY_SECONDS = 15 * 60;
/** The job holds a sign-in link, so it is deleted soon after it is sent. */
const VERIFICATION_EMAIL_RETENTION_SECONDS = 60 * 60;

const VERIFICATION_EMAIL_POLICY: QueuePolicy = {
  retryLimit: VERIFICATION_EMAIL_RETRY_LIMIT,
  expireInSeconds: VERIFICATION_EMAIL_EXPIRY_SECONDS,
  retentionSeconds: VERIFICATION_EMAIL_RETENTION_SECONDS,
};

/** Both processes call this at start-up, since either may start first. */
export async function declareVerificationEmailQueue(jobs: JobQueue): Promise<void> {
  await jobs.declareQueue(VERIFICATION_EMAIL_QUEUE, VERIFICATION_EMAIL_POLICY);
}
