import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button-link';
import { FeatureCard } from '@/components/site/feature-card';
import { FeatureGrid } from '@/components/site/feature-grid';
import { ScreenshotPlaceholder } from '@/components/site/screenshot-placeholder';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return { title: t('title') };
}

const PILLARS = ['connected', 'reminders', 'control'] as const;

export default async function HomePage() {
  const t = await getTranslations('home');
  const site = await getTranslations('site');
  return (
    <>
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold sm:text-5xl">{t('hero.heading')}</h1>
          <p className="text-muted-foreground mt-4 text-lg">{t('hero.body')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/sign-up">{site('getStarted')}</ButtonLink>
            <ButtonLink href="/how-it-works" variant="outline">
              {t('hero.secondary')}
            </ButtonLink>
          </div>
        </div>
        <ScreenshotPlaceholder name={t('hero.screenshotName')} />
      </section>

      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-semibold">{t('pillars.heading')}</h2>
        <FeatureGrid>
          {PILLARS.map((id) => (
            <FeatureCard
              key={id}
              title={t(`pillars.items.${id}.title`)}
              body={t(`pillars.items.${id}.body`)}
            />
          ))}
        </FeatureGrid>
      </section>

      <section className="mt-16 rounded-xl border p-8">
        <h2 className="text-2xl font-semibold">{t('cta.heading')}</h2>
        <p className="text-muted-foreground mt-2">{t('cta.body')}</p>
        <ButtonLink href="/sign-up" className="mt-5">
          {t('cta.button')}
        </ButtonLink>
      </section>
    </>
  );
}
