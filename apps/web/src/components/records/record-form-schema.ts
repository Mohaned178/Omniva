import {
  recordFieldsSchemaFor,
  RecordTitleSchema,
  type RecordFields,
  type RecordView,
  type TypeDefinition,
} from '@omniva/schemas';
import { z } from 'zod';

/** What the form's inputs hold: text, keyed like the record. */
export interface RecordFormValues {
  readonly title: string;
  readonly fields: Readonly<Record<string, string>>;
}

/** What the form submits, ready for the API. */
export interface RecordFormOutput {
  readonly title: string;
  readonly fields: RecordFields;
}

/**
 * Validates the form with the same shared schemas the API uses (CODING_STANDARDS §10): the
 * inputs' text is first turned into the record's shape, with empty inputs left out and
 * numbers read as numbers, so errors arrive at the same paths as the inputs.
 */
export function recordFormSchemaFor(type: TypeDefinition) {
  return z
    .object({ title: z.string(), fields: z.record(z.string(), z.string()) })
    .transform((values) => toRecordShape(type, values))
    .pipe(z.object({ title: RecordTitleSchema, fields: recordFieldsSchemaFor(type) }));
}

function toRecordShape(type: TypeDefinition, values: RecordFormValues): RecordFormOutput {
  const fields: Record<string, string | number> = {};
  for (const { key, kind } of type.fields) {
    const input = values.fields[key]?.trim() ?? '';
    if (input === '') continue;
    // An input that is not a number becomes NaN, which the shared schema refuses.
    fields[key] = kind === 'number' ? Number(input) : input;
  }
  return { title: values.title, fields };
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
