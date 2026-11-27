import { parseDateValue } from '@omniva/domain-rules';
import { z } from 'zod';
import type { FieldKind, TypeDefinition } from './type-definition.js';

const MAX_TEXT_FIELD_LENGTH = 500;

/**
 * A record's Type-specific fields by key, stored in one flexible structured field (ADR 0011).
 * This is the shape on the wire; `recordFieldsSchemaFor` validates against the Type itself.
 */
export const RecordFieldsSchema = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .meta({ id: 'RecordFields' });
export type RecordFields = z.infer<typeof RecordFieldsSchema>;

const VALUE_SCHEMAS: Readonly<Record<FieldKind, z.ZodType<string | number>>> = {
  text: z.string().trim().min(1).max(MAX_TEXT_FIELD_LENGTH),
  // Zod 4 numbers refuse NaN and infinities already.
  number: z.number(),
  date: z.iso.date(),
};

/**
 * A Key date field also takes a month only (`2027-03`) or the mark `missing` (spec D42), so a
 * record holds what the user actually knows.
 */
const KEY_DATE_SCHEMA = z.string().refine((text) => parseDateValue(text) !== undefined);

/**
 * Validates a record's fields against its Type definition (ADR 0011): only the Type's own
 * fields, each holding its kind of value. Every field is optional, so a record can start with
 * just its title and grow.
 */
export function recordFieldsSchemaFor(
  definition: TypeDefinition,
): z.ZodType<RecordFields, RecordFields> {
  // The shape is only known at run time, so the inferred type is widened to the fields' own.
  return z.strictObject(
    Object.fromEntries(
      definition.fields.map(({ key, kind }) => [
        key,
        (definition.keyDateFields.includes(key) ? KEY_DATE_SCHEMA : VALUE_SCHEMAS[kind]).optional(),
      ]),
    ),
  ) as z.ZodType<RecordFields, RecordFields>;
}
