import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RecordPage } from '@/components/records/record-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('records.titles');
  return { title: t('record') };
}

/** A record's own page; its content loads in the browser (ADR 0019). */
export default async function RecordRoute({
  params,
}: {
  readonly params: Promise<{ readonly recordId: string }>;
}) {
  const { recordId } = await params;
  return <RecordPage recordId={recordId} />;
}
