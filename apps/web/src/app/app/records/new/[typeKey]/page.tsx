import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NewRecord } from '@/components/records/new-record';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('records.titles');
  return { title: t('newRecord') };
}

/** Creating a record of a Type. */
export default async function NewRecordRoute({
  params,
}: {
  readonly params: Promise<{ readonly typeKey: string }>;
}) {
  const { typeKey } = await params;
  return <NewRecord typeKey={typeKey} />;
}
