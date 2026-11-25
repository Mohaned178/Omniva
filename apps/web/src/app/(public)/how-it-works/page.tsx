import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { FeatureCard } from '@/components/site/feature-card';
import { PageIntro } from '@/components/site/page-intro';
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
          <FeatureCard key={id} title={t(`steps.${id}.title`)} body={t(`steps.${id}.body`)} />
        ))}
      </ol>
      <div className="mt-12">
        <ScreenshotPlaceholder name={t('screenshotName')} />
      </div>
    </>
  );
}
