import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('appShell.home');
  return { title: t('title') };
}

/** Where a signed-in user lands. The Overview replaces this once it exists. */
export default function AppHomePage() {
  const t = useTranslations('appShell.home');
  return (
    <section>
      <h1 className="text-3xl font-semibold">{t('heading')}</h1>
      <p className="text-muted-foreground mt-3">{t('body')}</p>
    </section>
  );
}
