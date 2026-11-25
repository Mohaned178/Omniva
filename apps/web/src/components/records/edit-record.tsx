'use client';

import { useTranslations } from 'next-intl';
import { recordPath } from '@/lib/routes';
import { QueryStatus } from './query-status';
import { RecordForm } from './record-form';
import { useRecord, useTypes } from './record-queries';

/** Editing the record the path names. */
export function EditRecord({ recordId }: { readonly recordId: string }) {
  const t = useTranslations('records');
  const record = useRecord(recordId);
  const types = useTypes();

  if (record.data === undefined || types.data === undefined) {
    return <QueryStatus isError={record.isError || types.isError} />;
  }
  if (record.data === null) return <p role="alert">{t('notFound')}</p>;
  const { typeKey, title } = record.data;
  const type = types.data.find(({ key }) => key === typeKey);
  if (!type) return <QueryStatus isError />;
  return (
    <RecordForm
      type={type}
      record={record.data}
      heading={t('form.editHeading', { title })}
      cancelPath={recordPath(recordId)}
    />
  );
}
