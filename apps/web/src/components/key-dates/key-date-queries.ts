import { addCalendarDays, calendarDateOf, isoDayOf } from '@omniva/domain-rules';
import type { KeyDateAttentionItem, KeyDateAttentionList } from '@omniva/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspaceId } from '@/components/app/use-workspace-id';
import { recordKeys } from '@/components/records/record-queries';
import { api } from '@/lib/api';

/** How far a snooze puts a reminder off: a week, the digest's default rhythm. */
const SNOOZE_DAYS = 7;

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

/** What the user does about a date on the attention list (spec D57). */
type ReminderAction = 'handled' | 'snoozed';

/** Marks a date's reminder handled, or snoozes it for a week, then refreshes the list. */
export function useReminderAction(item: KeyDateAttentionItem) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (action: ReminderAction) => {
      const { recordId, fieldKey, date } = item;
      const { response } = await api.PUT(
        '/v1/workspaces/{workspaceId}/records/{recordId}/key-dates/{fieldKey}/reminder',
        {
          params: { path: { workspaceId, recordId, fieldKey } },
          body:
            action === 'handled'
              ? { date, status: action }
              : { date, status: action, until: aWeekFromToday() },
        },
      );
      if (!response.ok) {
        throw new Error(`The reminder action failed with ${String(response.status)}`);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all(workspaceId) }),
  });
}

/** "Today" is the UTC day, as the API counts it until a workspace time zone exists. */
function aWeekFromToday(): string {
  return isoDayOf(addCalendarDays(calendarDateOf(new Date()), SNOOZE_DAYS));
}
