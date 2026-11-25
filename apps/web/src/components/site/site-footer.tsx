import { useTranslations } from 'next-intl';

export function SiteFooter() {
  const t = useTranslations('site');
  return (
    <footer className="text-muted-foreground border-t">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm">
        <p>{t('footer.tagline')}</p>
        <p className="mt-2">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
