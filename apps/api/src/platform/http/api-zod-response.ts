import { ApiResponse } from '@nestjs/swagger';
import type { z } from 'zod';
import { zodComponentRef } from './zod-openapi-components.js';

export interface ZodResponseOptions {
  readonly status: number;
  readonly description: string;
  readonly schema: z.ZodType;
}

/** Documents a response by its shared Zod schema, so the shape is defined once (§4, §9). */
export function ApiZodResponse({
  status,
  description,
  schema,
}: ZodResponseOptions): MethodDecorator {
  return ApiResponse({ status, description, schema: { $ref: zodComponentRef(schema) } });
}
