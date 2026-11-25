import { Query } from '@nestjs/common';
import type { z } from 'zod';
import { ZodParsePipe } from './zod-parse-pipe.js';

/** The query string, parsed by a shared schema. */
export function ZodQuery(schema: z.ZodType): ParameterDecorator {
  return Query(new ZodParsePipe(schema));
}
