import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ModuleRecordList } from '@/components/records/module-record-list';
import { modulePath } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('records.titles');
  return { title: t('archived') };
}

/** The records put away from Assets & Possessions. */
export default function ArchivedAssetsPage() {
  return <ModuleRecordList module="assets" archived otherListPath={modulePath('assets')} />;
}
