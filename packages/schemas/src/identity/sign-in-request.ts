import { z } from 'zod';
import { MAX_PASSWORD_LENGTH } from './sign-up-request.js';

/** Sign-in checks only that a password was given, so it never reveals the password rules. */
export const SignInRequestSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
  })
  .meta({ id: 'SignInRequest' });
export type SignInRequest = z.infer<typeof SignInRequestSchema>;
