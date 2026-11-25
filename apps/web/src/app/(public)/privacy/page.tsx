import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageIntro } from '@/components/site/page-intro';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('privacy');
  return { title: t('title') };
}

const COMMITMENTS = ['sell', 'ai', 'export', 'delete', 'share', 'readOnly'] as const;

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');
  return (
    <>
      <PageIntro heading={t('heading')} intro={t('intro')} />
      <ul className="list-disc space-y-3 ps-5 text-lg">
        {COMMITMENTS.map((id) => (
          <li key={id}>{t(`commitments.${id}`)}</li>
        ))}
      </ul>
      <section className="mt-10">
        <h2 className="text-xl font-semibold">{t('analytics.heading')}</h2>
        <p className="text-muted-foreground mt-2">{t('analytics.body')}</p>
      </section>
    </>
  );
}
