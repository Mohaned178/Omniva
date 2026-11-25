import { useTranslations } from 'next-intl';

/** Stands in for a real screenshot until the app UI exists. */
export function ScreenshotPlaceholder({ name }: { readonly name: string }) {
  const t = useTranslations('site');
  return (
    <div
      role="img"
      aria-label={t('screenshot', { name })}
      className="bg-muted text-muted-foreground flex aspect-video w-full items-center justify-center rounded-xl border p-4 text-center text-sm"
    >
      {name}
    </div>
  );
}
