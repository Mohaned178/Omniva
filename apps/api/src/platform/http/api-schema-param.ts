import { ApiParam } from '@nestjs/swagger';
import type { z } from 'zod';
import { zodComponentRef } from './zod-openapi-components.js';

/** Documents a path parameter by its shared schema. */
export function ApiSchemaParam(name: string, schema: z.ZodType): MethodDecorator {
  // ApiParam takes no bare $ref; a one-item allOf points at the shared schema all the same.
  return ApiParam({ name, schema: { allOf: [{ $ref: zodComponentRef(schema) }] } });
}
