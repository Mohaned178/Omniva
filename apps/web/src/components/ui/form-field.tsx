import { type ComponentProps, useId } from 'react';
import { Input } from './input';
import { Label } from './label';

interface FormFieldProps extends ComponentProps<'input'> {
  readonly label: string;
  readonly hint?: string | undefined;
  /** The message for the field's current error, already translated. */
  readonly error?: string | undefined;
}

/** A labelled input whose hint and error are announced with it (WCAG 2.2 AA). */
export function FormField({ label, hint, error, ...inputProps }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint ? (
        <p id={hintId} className="text-muted-foreground text-sm">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
