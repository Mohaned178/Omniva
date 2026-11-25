import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button-link';
import { PageIntro } from '@/components/site/page-intro';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing');
  return { title: t('title') };
}

const PROMISES = ['read', 'ads', 'export'] as const;

export default async function PricingPage() {
  const t = await getTranslations('pricing');
  return (
    <>
      <PageIntro heading={t('heading')} intro={t('intro')} />
      <section className="rounded-xl border p-6">
        <h2 className="text-xl font-semibold">{t('promise.heading')}</h2>
        <ul className="mt-4 list-disc space-y-2 ps-5">
          {PROMISES.map((id) => (
            <li key={id}>{t(`promise.items.${id}`)}</li>
          ))}
        </ul>
      </section>
      <ButtonLink href="/sign-up" className="mt-8">
        {t('cta')}
      </ButtonLink>
    </>
  );
}
