import { z } from 'zod';

/** Long enough to resist guessing; the upper bound keeps password hashing cheap to refuse. */
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 128;

export const SignUpRequestSchema = z
  .object({
    email: z.email(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  })
  .meta({ id: 'SignUpRequest' });
export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;
