import type { KeyDateAttentionList } from '@omniva/schemas';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceId } from '@/components/app/use-workspace-id';
import { recordKeys } from '@/components/records/record-queries';
import { api } from '@/lib/api';

/** The Key dates coming up and the ones marked missing. */
export function useKeyDateAttention() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    // Under the records' key, so any change to a record refreshes it.
    queryKey: [...recordKeys.all(workspaceId), 'key-date-attention'] as const,
    queryFn: async (): Promise<KeyDateAttentionList> => {
      const { data } = await api.GET('/v1/workspaces/{workspaceId}/key-dates/attention', {
        params: { path: { workspaceId } },
      });
      if (!data) throw new Error('The attention list could not be loaded');
      return data;
    },
  });
}
