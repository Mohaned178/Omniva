import { applyDecorators, Body, type PipeTransform } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import type { z } from 'zod';
import { InvalidInput } from './domain-error.js';
import { zodComponentRef } from './zod-openapi-components.js';

/** Parses a request body with its shared Zod schema; anything else is invalid input (§4). */
class ZodParsePipe<Schema extends z.ZodType> implements PipeTransform<unknown, z.infer<Schema>> {
  constructor(private readonly schema: Schema) {}

  transform(value: unknown): z.infer<Schema> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      // Field paths only: the issue messages could quote what the user typed.
      const fields = result.error.issues.map((issue) => issue.path.join('.') || '(body)');
      throw new InvalidInput(`Invalid fields: ${[...new Set(fields)].join(', ')}`);
    }
    return result.data;
  }
}

/** The request body, parsed by a shared schema. */
export function ZodBody(schema: z.ZodType): ParameterDecorator {
  return Body(new ZodParsePipe(schema));
}

/** Documents a request body by its shared Zod schema, so the shape is defined once (§9). */
export function ApiZodBody(schema: z.ZodType): MethodDecorator {
  return applyDecorators(ApiBody({ schema: { $ref: zodComponentRef(schema) } }));
}
