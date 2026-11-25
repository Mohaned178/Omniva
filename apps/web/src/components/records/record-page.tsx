'use client';

import type { FieldKind, RecordView } from '@omniva/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import { useId } from 'react';
import { useCurrentSession } from '@/components/app/use-current-session';
import { useWorkspaceId } from '@/components/app/use-workspace-id';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { FormAlert } from '@/components/ui/form-alert';
import { api } from '@/lib/api';
import { editRecordPath } from '@/lib/routes';
import { QueryStatus } from './query-status';
import { recordKeys, useRecord, useRecordHistory, useTypes } from './record-queries';
import { useTypeWording } from './use-type-wording';

/** A record's own page: what it is, where it stands, its details and its history. */
export function RecordPage({ recordId }: { readonly recordId: string }) {
  const t = useTranslations('records');
  const record = useRecord(recordId);

  if (record.data === undefined) return <QueryStatus isError={record.isError} />;
  if (record.data === null) return <p role="alert">{t('notFound')}</p>;
  return <RecordPageContent record={record.data} />;
}

function RecordPageContent({ record }: { readonly record: RecordView }) {
  const t = useTranslations('records');
  const wording = useTypeWording();
  const archive = useArchiveToggle(record);
  const state = record.lifecycleState === null ? null : t(`lifecycle.${record.lifecycleState}`);
  const typeName = wording.typeName(record.typeKey);

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{record.title}</h1>
        <p className="text-muted-foreground flex flex-wrap items-center gap-2">
          <span>
            {state === null ? typeName : t('page.typeAndState', { type: typeName, state })}
          </span>
          {record.isArchived ? <Badge>{t('page.archived')}</Badge> : null}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <ButtonLink href={editRecordPath(record.id)} variant="outline">
            {t('page.edit')}
          </ButtonLink>
          <Button
            variant="outline"
            onClick={() => {
              archive.mutate();
            }}
            disabled={archive.isPending}
          >
            {record.isArchived ? t('page.unarchive') : t('page.archive')}
          </Button>
        </div>
        {archive.isError ? <FormAlert>{t('page.actionFailed')}</FormAlert> : null}
      </header>
      <RecordDetails record={record} />
      <RecordHistoryList recordId={record.id} />
    </article>
  );
}

/** Archives the record, or brings it back, and refreshes everything that shows it. */
function useArchiveToggle(record: RecordView) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const params = { path: { workspaceId, recordId: record.id } };
      const { response } = record.isArchived
        ? await api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/unarchive', { params })
        : await api.POST('/v1/workspaces/{workspaceId}/records/{recordId}/archive', { params });
      if (!response.ok) throw new Error(`Archiving failed with ${String(response.status)}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all(workspaceId) }),
  });
}

function RecordDetails({ record }: { readonly record: RecordView }) {
  const t = useTranslations('records');
  const wording = useTypeWording();
  const formatValue = useFieldValueFormat();
  const type = useTypes().data?.find(({ key }) => key === record.typeKey);
  const filled = (type?.fields ?? []).filter(({ key }) => record.fields[key] !== undefined);

  return (
    <section aria-labelledby="record-details" className="space-y-3">
      <h2 id="record-details" className="text-xl font-semibold">
        {t('page.details')}
      </h2>
      {filled.length === 0 ? (
        <p className="text-muted-foreground">{t('page.noDetails')}</p>
      ) : (
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]">
          {filled.map(({ key, kind }) => (
            <div key={key} className="contents">
              <dt className="text-muted-foreground">{wording.fieldLabel(record.typeKey, key)}</dt>
              <dd>{formatValue(kind, record.fields[key] ?? '')}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** Shows a field's value in the user's locale. */
function useFieldValueFormat() {
  const format = useFormatter();
  return (kind: FieldKind, value: string | number): string => {
    switch (kind) {
      case 'date':
        // A calendar date has no time zone (CODING_STANDARDS §6): read and shown as UTC, so
        // it is the same day everywhere.
        return format.dateTime(new Date(`${String(value)}T00:00:00Z`), {
          dateStyle: 'medium',
          timeZone: 'UTC',
        });
      case 'number':
        // Numbers such as a year read wrongly with thousands separators.
        return typeof value === 'number' ? format.number(value, { useGrouping: false }) : value;
      case 'text':
        return String(value);
      default: {
        const unknownKind: never = kind;
        return String(unknownKind);
      }
    }
  };
}

function RecordHistoryList({ recordId }: { readonly recordId: string }) {
  const t = useTranslations('records');
  const format = useFormatter();
  const headingId = useId();
  const { data: session } = useCurrentSession();
  const history = useRecordHistory(recordId);

  function actorOf(actorUserId: string | null): 'you' | 'omniva' | 'other' {
    if (actorUserId === null) return 'omniva';
    return actorUserId === session?.user.id ? 'you' : 'other';
  }

  return (
    <section className="space-y-3">
      <h2 id={headingId} className="text-xl font-semibold">
        {t('history.heading')}
      </h2>
      {history.data === undefined ? (
        <QueryStatus isError={history.isError} />
      ) : (
        <ul aria-labelledby={headingId} className="space-y-1">
          {history.data.map((entry, position) => (
            // History only grows at the end, so an entry's position identifies it.
            <li key={position}>
              {t('history.entry', {
                action: entry.action,
                actor: actorOf(entry.actorUserId),
                time: format.dateTime(new Date(entry.occurredAt), {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
              })}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
