import { applyDecorators, Body } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import type { z } from 'zod';
import { ZodParsePipe } from './zod-parse-pipe.js';
import { zodComponentRef } from './zod-openapi-components.js';

/** The request body, parsed by a shared schema. */
export function ZodBody(schema: z.ZodType): ParameterDecorator {
  return Body(new ZodParsePipe(schema));
}

/** Documents a request body by its shared Zod schema, so the shape is defined once (§9). */
export function ApiZodBody(schema: z.ZodType): MethodDecorator {
  return applyDecorators(ApiBody({ schema: { $ref: zodComponentRef(schema) } }));
}
