import {
  recordFieldsSchemaFor,
  RecordTitleSchema,
  type RecordFields,
  type RecordView,
  type TypeDefinition,
} from '@omniva/schemas';
import { z } from 'zod';
import { FIELD_KIND_INPUTS } from './field-kind-inputs';

/** What the form's inputs hold: text, keyed like the record. */
const RecordFormInputSchema = z.object({
  title: z.string(),
  // A Key date's input registers with no value until it is touched.
  fields: z.record(z.string(), z.string().optional()),
});

export type RecordFormValues = z.input<typeof RecordFormInputSchema>;
export type RecordFormOutput = z.output<ReturnType<typeof recordFormSchemaFor>>;

/**
 * Validates the form with the same shared schemas the API uses (CODING_STANDARDS §10): the
 * inputs' text is first turned into the record's shape, with empty inputs left out, so errors
 * arrive at the same paths as the inputs.
 */
export function recordFormSchemaFor(type: TypeDefinition) {
  return RecordFormInputSchema.transform(({ title, fields }) => ({
    title,
    fields: toRecordFields(type, fields),
  })).pipe(z.object({ title: RecordTitleSchema, fields: recordFieldsSchemaFor(type) }));
}

function toRecordFields(type: TypeDefinition, inputs: RecordFormValues['fields']): RecordFields {
  const fields: Record<string, string | number> = {};
  for (const { key, kind } of type.fields) {
    const text = inputs[key]?.trim() ?? '';
    if (text !== '') fields[key] = FIELD_KIND_INPUTS[kind].fromInput(text);
  }
  return fields;
}

/** The form's starting values: empty for a new record, the record's own when editing. */
export function recordFormValuesOf(record: RecordView | undefined): RecordFormValues {
  if (!record) return { title: '', fields: {} };
  return {
    title: record.title,
    fields: Object.fromEntries(
      Object.entries(record.fields).map(([key, value]) => [key, String(value)]),
    ),
  };
}
