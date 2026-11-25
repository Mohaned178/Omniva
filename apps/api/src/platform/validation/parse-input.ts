import type { z } from 'zod';
import { InvalidInput } from '../http/invalid-input.js';

/**
 * Parses input from outside the process with a Zod schema; anything else is refused as
 * invalid input (CODING_STANDARDS §4).
 */
export function parseInput<Schema extends z.ZodType>(
  schema: Schema,
  value: unknown,
): z.infer<Schema> {
  const result = schema.safeParse(value);
  if (!result.success) {
    // Field paths only: the issue messages could quote what the user typed.
    const fields = result.error.issues.map((issue) => issue.path.join('.') || '(body)');
    throw new InvalidInput(`Invalid fields: ${[...new Set(fields)].join(', ')}`);
  }
  return result.data;
}
