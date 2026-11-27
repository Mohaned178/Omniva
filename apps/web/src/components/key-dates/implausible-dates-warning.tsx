'use client';

import type { ImplausibleDate } from '@omniva/domain-rules';
import type { TypeDefinition } from '@omniva/schemas';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useTypeWording } from '@/components/records/use-type-wording';

interface ImplausibleDatesWarningProps {
  readonly type: TypeDefinition;
  readonly found: readonly ImplausibleDate[];
  /** The user has read the warning and wants the dates saved as they are. */
  readonly onSaveAsGiven: () => void;
}

/** Says which dates look like typos before anything is saved, and leaves the choice to the user (spec D45). */
export function ImplausibleDatesWarning({
  type,
  found,
  onSaveAsGiven,
}: ImplausibleDatesWarningProps) {
  const t = useTranslations('keyDates.implausible');
  const wording = useTypeWording();
  const label = (field: string) => wording.fieldLabel(type.key, field);

  return (
    <div role="alert" className="border-destructive space-y-3 rounded-md border p-3 text-sm">
      <p className="font-medium">{t('heading')}</p>
      <ul className="list-disc ps-5">
        {found.map((date) => (
          <li key={`${date.field}-${date.reason}`}>
            {date.reason === 'before-earlier-date'
              ? t('beforeEarlier', { field: label(date.field), earlier: label(date.earlierField) })
              : t(date.reason === 'too-far-ahead' ? 'tooFarAhead' : 'tooFarBehind', {
                  field: label(date.field),
                })}
          </li>
        ))}
      </ul>
      <p>{t('advice')}</p>
      <Button type="button" variant="outline" onClick={onSaveAsGiven}>
        {t('saveAsGiven')}
      </Button>
    </div>
  );
}
