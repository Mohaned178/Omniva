import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { EditRecord } from '@/components/records/edit-record';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('records.titles');
  return { title: t('editRecord') };
}

/** Editing a record; its content loads in the browser (ADR 0019). */
export default async function EditRecordRoute({
  params,
}: {
  readonly params: Promise<{ readonly recordId: string }>;
}) {
  const { recordId } = await params;
  return <EditRecord recordId={recordId} />;
}
