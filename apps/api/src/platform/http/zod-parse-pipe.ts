import type { PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { parseInput } from '../validation/parse-input.js';

/** Parses request input with its shared Zod schema; anything else is invalid input (§4). */
export class ZodParsePipe<Schema extends z.ZodType> implements PipeTransform<
  unknown,
  z.infer<Schema>
> {
  constructor(private readonly schema: Schema) {}

  transform(value: unknown): z.infer<Schema> {
    return parseInput(this.schema, value);
  }
}
