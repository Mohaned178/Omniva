import { z } from 'zod';
import { BlockSchema } from './block.js';
import { LifeModuleSchema } from './life-module.js';
import { TypeKeySchema } from './type-key.js';

const MAX_FIELD_KEY_LENGTH = 64;

/** What a field holds: free text, a number, or a calendar date. */
export const FIELD_KINDS = ['text', 'number', 'date'] as const;
export type FieldKind = (typeof FIELD_KINDS)[number];

/** Names a field within its Type, such as `registrationNumber`. */
export const FieldKeySchema = z
  .string()
  .max(MAX_FIELD_KEY_LENGTH)
  .regex(/^[a-z][A-Za-z0-9]*$/)
  .meta({ id: 'FieldKey' });

/** One Type-specific field a record of the Type may carry. */
export const FieldDefinitionSchema = z
  .object({ key: FieldKeySchema, kind: z.enum(FIELD_KINDS) })
  .meta({ id: 'FieldDefinition' });
export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;

/** As early as a reminder can come: two years covers any renewal or expiry. */
export const MAX_REMINDER_DAYS_BEFORE = 730;

/**
 * When a reminder comes (GLOSSARY.md, Reminder rule): some days before one of a Type's Key
 * dates. A Type sets the rules its new records start with; each record then has its own.
 */
export const ReminderRuleSchema = z
  .object({
    keyDateField: FieldKeySchema,
    daysBefore: z.int().min(0).max(MAX_REMINDER_DAYS_BEFORE),
  })
  .meta({ id: 'ReminderRule' });
export type ReminderRule = z.infer<typeof ReminderRuleSchema>;

/**
 * Two of a Type's date fields where `earlier` should not come after `later`, such as an
 * issue date and an expiry; a pair that breaks it is flagged before saving (spec D45).
 */
export const DateOrderSchema = z
  .object({ earlier: FieldKeySchema, later: FieldKeySchema })
  .meta({ id: 'DateOrder' });
export type DateOrder = z.infer<typeof DateOrderSchema>;

/**
 * The one definition shape every Type uses, built in or custom (ADR 0007, ADR 0011): its
 * fields, which of them are Key dates, the reminders it sets by default, its home module and
 * the building block it is built on.
 */
export const TypeDefinitionSchema = z
  .object({
    key: TypeKeySchema,
    block: BlockSchema,
    homeModule: LifeModuleSchema,
    fields: z.array(FieldDefinitionSchema),
    keyDateFields: z.array(FieldKeySchema),
    defaultReminderRules: z.array(ReminderRuleSchema),
    dateOrder: z.array(DateOrderSchema),
  })
  .superRefine((definition, context) => {
    const dateFields = new Set(
      definition.fields.filter(({ kind }) => kind === 'date').map(({ key }) => key),
    );
    for (const [index, order] of definition.dateOrder.entries()) {
      for (const side of ['earlier', 'later'] as const) {
        if (!dateFields.has(order[side])) {
          context.addIssue({
            code: 'custom',
            path: ['dateOrder', index, side],
            message: 'A date order must name the Type’s date fields',
          });
        }
      }
    }
    for (const [index, field] of definition.keyDateFields.entries()) {
      if (!dateFields.has(field)) {
        context.addIssue({
          code: 'custom',
          path: ['keyDateFields', index],
          message: 'A Key date must be one of the Type’s date fields',
        });
      }
    }
    for (const [index, rule] of definition.defaultReminderRules.entries()) {
      if (!definition.keyDateFields.includes(rule.keyDateField)) {
        context.addIssue({
          code: 'custom',
          path: ['defaultReminderRules', index, 'keyDateField'],
          message: 'A reminder rule must name one of the Type’s Key dates',
        });
      }
    }
  })
  .meta({ id: 'TypeDefinition' });
export type TypeDefinition = z.infer<typeof TypeDefinitionSchema>;

/** The Types a workspace can create records of. */
export const TypeListSchema = z
  .object({ types: z.array(TypeDefinitionSchema) })
  .meta({ id: 'TypeList' });
export type TypeList = z.infer<typeof TypeListSchema>;
