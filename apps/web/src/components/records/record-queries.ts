import type { LifeModule, RecordHistory, RecordView, TypeDefinition } from '@omniva/schemas';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceId } from '@/components/app/use-workspace-id';
import { api } from '@/lib/api';

const NOT_FOUND = 404;

/** Query keys for record data, so a change can refresh everything that shows the record. */
export const recordKeys = {
  all: (workspaceId: string) => ['records', workspaceId] as const,
  list: (workspaceId: string, module: LifeModule, archived: boolean) =>
    ['records', workspaceId, 'list', module, archived] as const,
  one: (workspaceId: string, recordId: string) =>
    ['records', workspaceId, 'one', recordId] as const,
  history: (workspaceId: string, recordId: string) =>
    ['records', workspaceId, 'history', recordId] as const,
  types: (workspaceId: string) => ['types', workspaceId] as const,
};

/** The records whose home is the module, in use or archived. */
export function useModuleRecords(module: LifeModule, archived: boolean) {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: recordKeys.list(workspaceId, module, archived),
    queryFn: async (): Promise<readonly RecordView[]> => {
      const { data } = await api.GET('/v1/workspaces/{workspaceId}/records', {
        params: { path: { workspaceId }, query: { module, archived } },
      });
      if (!data) throw new Error('The records could not be loaded');
      return data.records;
    },
  });
}

/** One record; `null` when it doesn't exist in the workspace. */
export function useRecord(recordId: string) {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: recordKeys.one(workspaceId, recordId),
    queryFn: async (): Promise<RecordView | null> => {
      const { data, response } = await api.GET('/v1/workspaces/{workspaceId}/records/{recordId}', {
        params: { path: { workspaceId, recordId } },
      });
      if (response.status === NOT_FOUND) return null;
      if (!data) throw new Error('The record could not be loaded');
      return data;
    },
  });
}

/** A record's own changes, oldest first. */
export function useRecordHistory(recordId: string) {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: recordKeys.history(workspaceId, recordId),
    queryFn: async (): Promise<RecordHistory['entries']> => {
      const { data } = await api.GET('/v1/workspaces/{workspaceId}/records/{recordId}/history', {
        params: { path: { workspaceId, recordId } },
      });
      if (!data) throw new Error('The history could not be loaded');
      return data.entries;
    },
  });
}

/** The Types records can be created from. */
export function useTypes() {
  const workspaceId = useWorkspaceId();
  return useQuery({
    queryKey: recordKeys.types(workspaceId),
    queryFn: async (): Promise<readonly TypeDefinition[]> => {
      const { data } = await api.GET('/v1/workspaces/{workspaceId}/types', {
        params: { path: { workspaceId } },
      });
      if (!data) throw new Error('The Types could not be loaded');
      return data.types;
    },
    staleTime: Infinity,
  });
}
