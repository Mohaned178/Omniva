'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { RecordView, TypeDefinition } from '@omniva/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useWorkspaceId } from '@/components/app/use-workspace-id';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { FormField } from '@/components/ui/form-field';
import { api } from '@/lib/api';
import { recordPath } from '@/lib/routes';
import {
  recordFormSchemaFor,
  recordFormValuesOf,
  type RecordFormOutput,
  type RecordFormValues,
} from './record-form-schema';
import { FIELD_KIND_INPUTS } from './field-kind-inputs';
import { recordKeys } from './record-queries';
import { useTypeWording } from './use-type-wording';

interface RecordFormProps {
  readonly type: TypeDefinition;
  readonly heading: string;
  /** The record being edited; a new record of the Type is created when there is none. */
  readonly record?: RecordView;
  /** Where Cancel goes. */
  readonly cancelPath: string;
}

/** Creates or edits a record of any Type: one input for its name and one per field. */
export function RecordForm({ type, heading, record, cancelPath }: RecordFormProps) {
  const t = useTranslations('records.form');
  const wording = useTypeWording();
  const save = useSaveRecord(type, record);
  const [hasFailed, setHasFailed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormValues, unknown, RecordFormOutput>({
    resolver: zodResolver(recordFormSchemaFor(type)),
    defaultValues: recordFormValuesOf(record),
  });

  async function submit(values: RecordFormOutput): Promise<void> {
    setHasFailed(false);
    setHasFailed(!(await save(values)));
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">{heading}</h1>
      <form
        noValidate
        onSubmit={(event) => void handleSubmit(submit)(event)}
        className="mt-8 max-w-xl space-y-5"
      >
        {hasFailed ? <FormAlert>{t('errors.saveFailed')}</FormAlert> : null}
        <FormField
          label={t('name')}
          autoComplete="off"
          error={
            errors.title
              ? errors.title.type === 'too_big'
                ? t('errors.tooLong')
                : t('errors.nameRequired')
              : undefined
          }
          {...register('title')}
        />
        {type.fields.map(({ key, kind }) => {
          const { inputType, inputMode, errorMessage } = FIELD_KIND_INPUTS[kind];
          return (
            <FormField
              key={key}
              label={wording.fieldLabel(type.key, key)}
              type={inputType}
              autoComplete="off"
              {...(inputMode !== undefined && { inputMode })}
              error={errors.fields?.[key] ? t(`errors.${errorMessage}`) : undefined}
              {...register(`fields.${key}`)}
            />
          );
        })}
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('save')}
          </Button>
          <Link href={cancelPath} className="underline">
            {t('cancel')}
          </Link>
        </div>
      </form>
    </section>
  );
}

/**
 * Saves the form's record, then shows it. Resolves to whether it saved; the API checks the
 * fields against the Type again, so a refusal is still possible.
 */
function useSaveRecord(type: TypeDefinition, record: RecordView | undefined) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const router = useRouter();

  return async (values: RecordFormOutput): Promise<boolean> => {
    const { data } = record
      ? await api.PATCH('/v1/workspaces/{workspaceId}/records/{recordId}', {
          params: { path: { workspaceId, recordId: record.id } },
          body: { title: values.title, fields: values.fields },
        })
      : await api.POST('/v1/workspaces/{workspaceId}/records', {
          params: { path: { workspaceId } },
          body: { typeKey: type.key, title: values.title, fields: values.fields },
        });
    if (!data) return false;
    await queryClient.invalidateQueries({ queryKey: recordKeys.all(workspaceId) });
    router.push(recordPath(data.id));
    return true;
  };
}
