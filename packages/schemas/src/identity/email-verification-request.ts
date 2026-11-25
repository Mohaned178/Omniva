import { z } from 'zod';

/** The token from the link in the verification email. */
export const EmailVerificationRequestSchema = z
  .object({ token: z.string().min(1) })
  .meta({ id: 'EmailVerificationRequest' });
export type EmailVerificationRequest = z.infer<typeof EmailVerificationRequestSchema>;
