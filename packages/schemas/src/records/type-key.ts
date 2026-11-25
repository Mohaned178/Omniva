import { z } from 'zod';

const MAX_TYPE_KEY_LENGTH = 64;

/** Names a Type, such as `vehicle`: lower-case words joined by underscores. */
export const TypeKeySchema = z
  .string()
  .max(MAX_TYPE_KEY_LENGTH)
  .regex(/^[a-z][a-z0-9_]*$/)
  .meta({ id: 'TypeKey' });
