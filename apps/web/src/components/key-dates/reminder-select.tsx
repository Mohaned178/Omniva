'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';

/** The lead times offered for a reminder, in days: from the day itself to about six months. */
const REMINDER_DAYS_BEFORE = [0, 1, 3, 7, 14, 30, 60, 90, 180] as const;

/** A Key date's reminder: days before it as text, or empty for none. */
export interface ReminderChoice {
  readonly daysBefore: string;
  readonly onChange: (daysBefore: string) => void;
}

/**
 * How long before a Key date its reminder comes, or no reminder at all (spec D23, D47). It is
 * described by the date's own label, which it sits under.
 */
export function ReminderSelect({
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
