import type { CurrentSession } from '@omniva/schemas';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const CURRENT_SESSION_QUERY_KEY = ['current-session'] as const;

const UNAUTHORIZED = 401;

/** Who is signed in; `null` when nobody is, so the app can send them to sign in. */
export function useCurrentSession() {
  return useQuery({
    queryKey: CURRENT_SESSION_QUERY_KEY,
    queryFn: async (): Promise<CurrentSession | null> => {
      const { data, response } = await api.GET('/v1/session');
      if (response.status === UNAUTHORIZED) return null;
      if (!data) throw new Error(`Session lookup failed with ${String(response.status)}`);
      return data;
    },
    retry: false,
  });
}
