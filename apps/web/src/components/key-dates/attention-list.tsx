'use client';

import { distanceInWords } from '@omniva/domain-rules';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { QueryStatus } from '@/components/records/query-status';
import { useTypeWording } from '@/components/records/use-type-wording';
import { editRecordPath, recordPath } from '@/lib/routes';
import Link from 'next/link';
import { useKeyDateAttention } from './key-date-queries';

/**
 * What needs attention among the user's Key dates: what is coming up, and the dates they have
 * not found yet (spec D44). The Overview takes this over with the rest of its attention list.
 */
export function KeyDateAttentionList() {
  const t = useTranslations('keyDates.attention');
  const wording = useTypeWording();
  const headingId = useId();
  const attention = useKeyDateAttention();

  if (attention.data === undefined) return <QueryStatus isError={attention.isError} />;
  const { upcoming, missing } = attention.data;

  return (
    <section aria-labelledby={headingId} className="space-y-6">
      <h2 id={headingId} className="text-xl font-semibold">
        {t('heading')}
      </h2>
      {upcoming.length === 0 && missing.length === 0 ? (
        <p className="text-muted-foreground">{t('empty')}</p>
      ) : null}
      {upcoming.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-medium">{t('upcoming')}</h3>
          <ul className="space-y-1">
            {upcoming.map((item) => (
              <li key={`${item.recordId}-${item.fieldKey}`}>
                <Link href={recordPath(item.recordId)} className="underline">
                  {item.recordTitle}
                </Link>
                {': '}
                {wording.fieldLabel(item.typeKey, item.fieldKey)}
                {', '}
                <UpcomingWords daysUntil={item.daysUntil} precision={item.precision} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {missing.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-medium">{t('missing')}</h3>
          <ul className="space-y-1">
            {missing.map((item) => (
              <li key={`${item.recordId}-${item.fieldKey}`}>
                <Link href={recordPath(item.recordId)} className="underline">
                  {item.recordTitle}
                </Link>
                {': '}
                {t('missingItem', { field: wording.fieldLabel(item.typeKey, item.fieldKey) })}{' '}
                <Link href={editRecordPath(item.recordId)} className="underline">
                  {t('fill')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function UpcomingWords({
  daysUntil,
  precision,
}: {
  readonly daysUntil: number;
  readonly precision: 'exact' | 'month';
}) {
  const t = useTranslations('keyDates.words');
  const distance = distanceInWords(daysUntil);
  const words =
    distance.unit === 'today'
      ? t('today')
      : t(`${distance.direction}.${distance.unit}`, { count: distance.count });
  return <>{precision === 'month' ? t('aboutThen', { words }) : words}</>;
}
