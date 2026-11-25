import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { FeatureCard } from '@/components/site/feature-card';
import { FeatureGrid } from '@/components/site/feature-grid';
import { PageIntro } from '@/components/site/page-intro';
import { ScreenshotPlaceholder } from '@/components/site/screenshot-placeholder';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('features');
  return { title: t('title') };
}

const ITEMS = ['records', 'keyDates', 'links', 'capture', 'sharing', 'export'] as const;

export default async function FeaturesPage() {
  const t = await getTranslations('features');
  return (
    <>
      <PageIntro heading={t('heading')} intro={t('intro')} />
      <FeatureGrid>
        {ITEMS.map((id) => (
          <FeatureCard key={id} title={t(`items.${id}.title`)} body={t(`items.${id}.body`)} />
        ))}
      </FeatureGrid>
      <div className="mt-12">
        <ScreenshotPlaceholder name={t('screenshotName')} />
      </div>
    </>
  );
}
