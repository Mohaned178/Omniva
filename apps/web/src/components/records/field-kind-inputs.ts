import type { FieldKind } from '@omniva/schemas';

/** How a form takes each kind of field. */
interface FieldKindInput {
  readonly inputType: 'text' | 'number' | 'date';
  readonly inputMode?: 'decimal';
  /** The `records.form.errors` message for a value the field cannot hold. */
  readonly errorMessage: 'tooLong' | 'number' | 'date';
  /** The record's value for the input's non-empty text. */
  readonly fromInput: (text: string) => string | number;
}

/** The one place a form decides anything by field kind. */
export const FIELD_KIND_INPUTS: Readonly<Record<FieldKind, FieldKindInput>> = {
  text: { inputType: 'text', errorMessage: 'tooLong', fromInput: (text) => text },
  // Text that is not a number becomes NaN, which the shared schema refuses.
  number: {
    inputType: 'number',
    inputMode: 'decimal',
    errorMessage: 'number',
    fromInput: Number,
  },
  date: { inputType: 'date', errorMessage: 'date', fromInput: (text) => text },
};
