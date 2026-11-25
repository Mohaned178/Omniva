import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ModuleRecordList } from '@/components/records/module-record-list';
import { archivedPath } from '@/lib/routes';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('modules');
  return { title: t('assets') };
}

/** Assets & Possessions: the records whose home it is. */
export default function AssetsPage() {
  return (
    <ModuleRecordList module="assets" archived={false} otherListPath={archivedPath('assets')} />
  );
}
