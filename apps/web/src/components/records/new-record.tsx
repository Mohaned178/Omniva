'use client';

import { modulePath } from '@/lib/routes';
import { QueryStatus } from './query-status';
import { RecordForm } from './record-form';
import { useTypes } from './record-queries';
import { useTypeWording } from './use-type-wording';

/** Creating a record of the Type the path names. */
export function NewRecord({ typeKey }: { readonly typeKey: string }) {
  const wording = useTypeWording();
  const types = useTypes();

  if (types.data === undefined) return <QueryStatus isError={types.isError} />;
  const type = types.data.find(({ key }) => key === typeKey);
  if (!type) return <QueryStatus isError />;
  return (
    <RecordForm
      type={type}
      heading={wording.newType(type.key)}
      cancelPath={modulePath(type.homeModule)}
    />
  );
}
