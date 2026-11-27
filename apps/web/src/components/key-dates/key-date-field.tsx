'use client';

import { MISSING_DATE_TEXT, parseDateValue } from '@omniva/domain-rules';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKeyDateWords } from './use-key-date-words';

type Precision = 'exact' | 'month' | 'missing';

const MONTH_TEXT_LENGTH = 7;

/** The lead times offered for a reminder, in days: from the day itself to about six months. */
const REMINDER_DAYS_BEFORE = [0, 1, 3, 7, 14, 30, 60, 90, 180] as const;

/** The date's reminder: days before it as text, or empty for none. */
interface ReminderChoice {
  readonly daysBefore: string;
  readonly onChange: (daysBefore: string) => void;
}

interface KeyDateFieldProps {
  readonly label: string;
  /** The record's text for the date: `2027-03-15`, `2027-03`, `missing`, or empty. */
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
  /** The message for the field's current error, already translated. */
  readonly error?: string | undefined;
  /** When given, the date's reminder can be chosen with it (spec D23, D47). */
  readonly reminder?: ReminderChoice | undefined;
}

/**
 * A Key date as the user knows it (spec D42): an exact day, a month only, or marked missing,
 * with what they entered said back in plain words so a typo is noticed at once (D46).
 */
export function KeyDateField({
  label,
  value,
  onChange,
  onBlur,
  error,
  reminder,
}: KeyDateFieldProps) {
  const t = useTranslations('keyDates.field');
  const words = useKeyDateWords();
  const id = useId();
  const [precision, setPrecision] = useState<Precision>(
    parseDateValue(value)?.precision ?? 'exact',
  );
  const wordsId = `${id}-words`;
  const errorId = `${id}-error`;
  const spoken = words(value);

  function changePrecision(next: Precision): void {
    setPrecision(next);
    onChange(valueAfterChangingTo(next, value));
  }

  return (
    <div className="space-y-1.5">
      <Label id={`${id}-label`} htmlFor={`${id}-input`}>
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id={`${id}-input`}
          type={precision === 'month' ? 'month' : 'date'}
          disabled={precision === 'missing'}
          value={precision === 'missing' ? '' : value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [spoken && wordsId, error && errorId].filter(Boolean).join(' ') || undefined
          }
          className="w-auto min-w-0 flex-1"
        />
        <select
          aria-label={t('precision')}
          aria-describedby={`${id}-label`}
          value={precision}
          onChange={(event) => {
            changePrecision(precisionOf(event.target.value));
          }}
          className="bg-background rounded-md border px-3 py-2 text-base"
        >
          <option value="exact">{t('exact')}</option>
          <option value="month">{t('month')}</option>
          <option value="missing">{t('missing')}</option>
        </select>
      </div>
      {spoken ? (
        <p id={wordsId} aria-live="polite" className="text-muted-foreground text-sm">
          {spoken}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      {reminder ? <ReminderSelect labelId={`${id}-label`} reminder={reminder} /> : null}
    </div>
  );
}

/** How long before the date its reminder comes, or no reminder at all. */
function ReminderSelect({
  labelId,
  reminder,
}: {
  readonly labelId: string;
  readonly reminder: ReminderChoice;
}) {
  const t = useTranslations('keyDates.reminder');
  const selectId = useId();
  const current = reminder.daysBefore === '' ? undefined : Number(reminder.daysBefore);
  // A lead time set elsewhere, such as through the API, stays visible and selected.
  const offered = [
    ...new Set([...REMINDER_DAYS_BEFORE, ...(current === undefined ? [] : [current])]),
  ].sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <label htmlFor={selectId} className="text-sm">
        {t('label')}
      </label>
      <select
        id={selectId}
        aria-describedby={labelId}
        value={reminder.daysBefore}
        onChange={(event) => {
          reminder.onChange(event.target.value);
        }}
        className="bg-background rounded-md border px-3 py-2 text-base"
      >
        <option value="">{t('none')}</option>
        {offered.map((days) => (
          <option key={days} value={String(days)}>
            {t('daysBefore', { count: days })}
          </option>
        ))}
      </select>
    </div>
  );
}

function precisionOf(optionValue: string): Precision {
  if (optionValue === 'month' || optionValue === 'missing') return optionValue;
  return 'exact';
}

/** What the field holds after the user changes how well they know the date. */
function valueAfterChangingTo(precision: Precision, current: string): string {
  switch (precision) {
    case 'missing':
      return MISSING_DATE_TEXT;
    case 'month':
      // Keep the month of a day already given; a month input can't hold a day.
      return parseDateValue(current)?.precision === 'exact'
        ? current.slice(0, MONTH_TEXT_LENGTH)
        : '';
    case 'exact':
      return '';
    default: {
      const unknownPrecision: never = precision;
      return String(unknownPrecision);
    }
  }
}
