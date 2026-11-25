import { useTranslations } from 'next-intl';

/** What a record screen shows while its data loads, or when it can't be loaded. */
export function QueryStatus({ isError }: { readonly isError: boolean }) {
  const t = useTranslations('records');
  if (isError) return <p role="alert">{t('unavailable')}</p>;
  return (
    <p role="status" className="text-muted-foreground">
      {t('loading')}
    </p>
  );
}
