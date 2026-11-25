import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageIntro } from '@/components/site/page-section';
import { ScreenshotPlaceholder } from '@/components/site/screenshot-placeholder';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('how');
  return { title: t('title') };
}

const STEPS = ['one', 'two', 'three', 'four'] as const;

export default async function HowItWorksPage() {
  const t = await getTranslations('how');
  return (
    <>
      <PageIntro heading={t('heading')} intro={t('intro')} />
      <ol className="grid gap-6 sm:grid-cols-2">
        {STEPS.map((id) => (
          <li key={id} className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">{t(`steps.${id}.title`)}</h2>
            <p className="text-muted-foreground mt-2 text-sm">{t(`steps.${id}.body`)}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12">
        <ScreenshotPlaceholder name={t('screenshotName')} />
      </div>
    </>
  );
}
