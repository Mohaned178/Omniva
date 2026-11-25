'use client';

import type { LifeModule } from '@omniva/schemas';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button-link';
import { newRecordPath, recordPath } from '@/lib/routes';
import { useModuleRecords, useTypes } from './record-queries';
import { useTypeWording } from './use-type-wording';

interface ModuleRecordListProps {
  readonly module: LifeModule;
  /** Where the other list lives: the archived records, or those in use. */
  readonly otherListPath: string;
  readonly archived: boolean;
}

/**
 * A module's list: the records whose home it is, in use or archived, with a way to add a
 * record of each of the module's Types.
 */
export function ModuleRecordList({ module, otherListPath, archived }: ModuleRecordListProps) {
  const t = useTranslations('records');
  const moduleName = useTranslations('modules')(module);
  const wording = useTypeWording();
  const records = useModuleRecords(module, archived);
  const types = useTypes();
  const moduleTypes = (types.data ?? []).filter(({ homeModule }) => homeModule === module);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">
          {archived ? t('list.archivedHeading') : moduleName}
        </h1>
        {archived ? null : (
          <div className="flex flex-wrap gap-2">
            {moduleTypes.map(({ key }) => (
              <ButtonLink key={key} href={newRecordPath(key)}>
                {wording.addType(key)}
              </ButtonLink>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        {records.isError ? (
          <p role="alert">{t('unavailable')}</p>
        ) : records.data === undefined ? (
          <p role="status" className="text-muted-foreground">
            {t('loading')}
          </p>
        ) : records.data.length === 0 ? (
          <p className="text-muted-foreground">{t('list.empty')}</p>
        ) : (
          <ul className="divide-y rounded-md border">
            {records.data.map((record) => (
              <li key={record.id} className="flex flex-wrap items-baseline gap-x-3 px-4 py-3">
                <Link href={recordPath(record.id)} className="font-medium underline">
                  {record.title}
                </Link>
                <span className="text-muted-foreground text-sm">
                  {wording.typeName(record.typeKey)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-sm">
        <Link href={otherListPath} className="underline">
          {archived ? t('list.showInUse', { module: moduleName }) : t('list.showArchived')}
        </Link>
      </p>
    </section>
  );
}
