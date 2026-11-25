import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HealthPanel } from '@/components/health/health-panel';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('health');
  return { title: t('title') };
}

/** Pre-rendered; the panel asks the API from the browser. */
export default function HealthPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-start px-4 py-12 sm:py-20">
      <HealthPanel />
    </main>
  );
}
