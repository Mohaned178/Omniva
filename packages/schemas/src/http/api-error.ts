import { z } from 'zod';

/**
 * The one error shape every /v1 endpoint returns (CODING_STANDARDS §4). `code` is stable and
 * machine-readable; `message` is a technical English description, never shown to users as is.
 */
export const ApiErrorSchema = z
  .object({ code: z.string(), message: z.string() })
  .meta({ id: 'ApiError' });
export type ApiError = z.infer<typeof ApiErrorSchema>;
