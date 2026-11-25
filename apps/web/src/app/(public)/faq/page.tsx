import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageIntro } from '@/components/site/page-intro';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faq');
  return { title: t('title') };
}

const ITEMS = ['what', 'account', 'cost', 'data', 'leave'] as const;

export default async function FaqPage() {
  const t = await getTranslations('faq');
  return (
    <>
      <PageIntro heading={t('heading')} />
      <dl className="max-w-2xl space-y-6">
        {ITEMS.map((id) => (
          <div key={id}>
            <dt className="font-semibold">{t(`items.${id}.q`)}</dt>
            <dd className="text-muted-foreground mt-1">{t(`items.${id}.a`)}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
