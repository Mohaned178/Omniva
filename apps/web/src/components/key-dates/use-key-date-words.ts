import { calendarDateOf, daysUntil, distanceInWords, parseDateValue } from '@omniva/domain-rules';
import type { DateValue } from '@omniva/schemas';
import { useFormatter, useTranslations } from 'next-intl';

/**
 * Says a Key date in plain words (spec D46): "in 3 days", "7 months ago", "sometime in March
 * 2027". Until a workspace's time zone applies, today is the UTC day, as on the server.
 */
export function useKeyDateWords() {
  const t = useTranslations('keyDates.words');
  const monthName = useMonthName();

  function wordsFor(value: DateValue): string {
    switch (value.precision) {
      case 'missing':
        return t('missing');
      case 'month':
        return t('monthOnly', { month: monthName(value.year, value.month) });
      case 'exact': {
        const distance = distanceInWords(daysUntil(calendarDateOf(new Date()), value) ?? 0);
        if (distance.unit === 'today') return t('today');
        return t(`${distance.direction}.${distance.unit}`, { count: distance.count });
      }
      default: {
        const unknownPrecision: never = value;
        return String(unknownPrecision);
      }
    }
  }

  /** The date in plain words, or nothing when the text is no date (yet). */
  return (text: string): string | undefined => {
    const value = parseDateValue(text);
    return value ? wordsFor(value) : undefined;
  };
}

/** Shows a date as the user gave it, in their locale: "Jun 30, 2027", "March 2027". */
export function useKeyDateText() {
  const t = useTranslations('keyDates.words');
  const format = useFormatter();
  const monthName = useMonthName();
  return (text: string): string => {
    const value = parseDateValue(text);
    if (!value) return text;
    switch (value.precision) {
      case 'missing':
        return t('missing');
      case 'month':
        return monthName(value.year, value.month);
      case 'exact': {
        // A calendar date has no time zone (CODING_STANDARDS §6): shown as UTC, so it is the
        // same day everywhere.
        const { year, month, day } = value.date;
        return format.dateTime(new Date(Date.UTC(year, month - 1, day)), {
          dateStyle: 'medium',
          timeZone: 'UTC',
        });
      }
      default: {
        const unknownPrecision: never = value;
        return String(unknownPrecision);
      }
    }
  };
}

function useMonthName() {
  const format = useFormatter();
  return (year: number, month: number): string =>
    format.dateTime(new Date(Date.UTC(year, month - 1, 1)), {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
}
