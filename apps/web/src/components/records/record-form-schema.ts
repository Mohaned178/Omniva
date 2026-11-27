import {
  recordFieldsSchemaFor,
  reminderRulesSchemaFor,
  RecordTitleSchema,
  type RecordFields,
  type RecordView,
  type ReminderRule,
  type TypeDefinition,
} from '@omniva/schemas';
import { z } from 'zod';
import { FIELD_KIND_INPUTS } from './field-kind-inputs';

/** What the form's inputs hold: text, keyed like the record. */
const RecordFormInputSchema = z.object({
  title: z.string(),
  // A Key date's input registers with no value until it is touched.
  fields: z.record(z.string(), z.string().optional()),
  /** Each Key date's reminder: days before it as text, or empty for none. */
  reminders: z.record(z.string(), z.string()),
});

export type RecordFormValues = z.input<typeof RecordFormInputSchema>;
export type RecordFormOutput = z.output<ReturnType<typeof recordFormSchemaFor>>;

/**
 * Validates the form with the same shared schemas the API uses (CODING_STANDARDS §10): the
 * inputs' text is first turned into the record's shape, with empty inputs left out, so errors
 * arrive at the same paths as the inputs. A Key date whose reminder choice was left alone keeps
 * the rules it had, even several set through the API.
 */
export function recordFormSchemaFor(type: TypeDefinition, record?: RecordView) {
  const initial = recordFormValuesOf(type, record).reminders;
  return RecordFormInputSchema.transform(({ title, fields, reminders }) => ({
    title,
    fields: toRecordFields(type, fields),
    reminderRules: type.keyDateFields.flatMap((field): ReminderRule[] => {
      const choice = reminders[field] ?? '';
      if (record && choice === initial[field]) return rulesFor(record.reminderRules, field);
      return choice === '' ? [] : [{ keyDateField: field, daysBefore: Number(choice) }];
    }),
  })).pipe(
    z.object({
      title: RecordTitleSchema,
      fields: recordFieldsSchemaFor(type),
      reminderRules: reminderRulesSchemaFor(type),
    }),
  );
}

function toRecordFields(type: TypeDefinition, inputs: RecordFormValues['fields']): RecordFields {
  const fields: Record<string, string | number> = {};
  for (const { key, kind } of type.fields) {
    const text = inputs[key]?.trim() ?? '';
    if (text !== '') fields[key] = FIELD_KIND_INPUTS[kind].fromInput(text);
  }
  return fields;
}

/**
 * The form's starting values: empty for a new record with the reminders its Type sets by
 * default (spec D23), the record's own when editing.
 */
export function recordFormValuesOf(
  type: TypeDefinition,
  record: RecordView | undefined,
): RecordFormValues {
  const rules = record?.reminderRules ?? type.defaultReminderRules;
  const reminders = Object.fromEntries(
    type.keyDateFields.map((field) => {
      const [first] = rulesFor(rules, field);
      return [field, first === undefined ? '' : String(first.daysBefore)];
    }),
  );
  if (!record) return { title: '', fields: {}, reminders };
  return {
    title: record.title,
    fields: Object.fromEntries(
      Object.entries(record.fields).map(([key, value]) => [key, String(value)]),
    ),
    reminders,
  };
}

function rulesFor(rules: readonly ReminderRule[], field: string): ReminderRule[] {
  return rules.filter(({ keyDateField }) => keyDateField === field);
}
