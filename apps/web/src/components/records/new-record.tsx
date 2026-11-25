'use client';

import { useTranslations } from 'next-intl';
import { modulePath } from '@/lib/routes';
import { RecordForm } from './record-form';
import { useTypes } from './record-queries';
import { useTypeWording } from './use-type-wording';

/** Creating a record of the Type the path names. */
export function NewRecord({ typeKey }: { readonly typeKey: string }) {
  const t = useTranslations('records');
  const wording = useTypeWording();
  const types = useTypes();

  if (types.isError) return <p role="alert">{t('unavailable')}</p>;
  if (types.data === undefined) {
    return (
      <p role="status" className="text-muted-foreground">
        {t('loading')}
      </p>
    );
  }
  const type = types.data.find(({ key }) => key === typeKey);
  if (!type) return <p role="alert">{t('unavailable')}</p>;
  return (
    <RecordForm
      type={type}
      heading={wording.newType(type.key)}
      cancelPath={modulePath(type.homeModule)}
    />
  );
}
