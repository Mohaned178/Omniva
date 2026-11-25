'use client';

import { useTranslations } from 'next-intl';
import { recordPath } from '@/lib/routes';
import { RecordForm } from './record-form';
import { useRecord, useTypes } from './record-queries';

/** Editing the record the path names. */
export function EditRecord({ recordId }: { readonly recordId: string }) {
  const t = useTranslations('records');
  const record = useRecord(recordId);
  const types = useTypes();

  if (record.isError || types.isError) return <p role="alert">{t('unavailable')}</p>;
  if (record.data === undefined || types.data === undefined) {
    return (
      <p role="status" className="text-muted-foreground">
        {t('loading')}
      </p>
    );
  }
  if (record.data === null) return <p role="alert">{t('notFound')}</p>;
  const { typeKey, title } = record.data;
  const type = types.data.find(({ key }) => key === typeKey);
  if (!type) return <p role="alert">{t('unavailable')}</p>;
  return (
    <RecordForm
      type={type}
      record={record.data}
      heading={t('form.editHeading', { title })}
      cancelPath={recordPath(recordId)}
    />
  );
}
