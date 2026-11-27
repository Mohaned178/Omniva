import type { z } from 'zod';
import { ReminderRuleSchema, type ReminderRule, type TypeDefinition } from './type-definition.js';

/** How many reminders one record may have, across all its Key dates. */
const MAX_REMINDER_RULES = 20;

/**
 * A record's own reminder rules, replacing those it had (spec D47). Each names one of the
 * Type's Key dates; `reminderRulesSchemaFor` checks that against the Type itself.
 */
export const RecordReminderRulesSchema = ReminderRuleSchema.array()
  .max(MAX_REMINDER_RULES)
  .meta({ id: 'RecordReminderRules' });
export type RecordReminderRules = z.infer<typeof RecordReminderRulesSchema>;

/** The rules for one of a record's Key dates. */
export function reminderRulesFor(
  rules: readonly ReminderRule[],
  keyDateField: string,
): ReminderRule[] {
  return rules.filter((rule) => rule.keyDateField === keyDateField);
}

/** Validates a record's reminder rules against its Type: each must name one of its Key dates. */
export function reminderRulesSchemaFor(definition: TypeDefinition) {
  return RecordReminderRulesSchema.superRefine((rules, context) => {
    for (const [index, { keyDateField }] of rules.entries()) {
      if (!definition.keyDateFields.includes(keyDateField)) {
        context.addIssue({
          code: 'custom',
          path: [index, 'keyDateField'],
          message: 'A reminder rule must name one of the Type’s Key dates',
        });
      }
    }
  });
}
