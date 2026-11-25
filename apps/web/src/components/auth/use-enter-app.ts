import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CURRENT_SESSION_QUERY_KEY } from '@/components/app/use-current-session';
import { APP_HOME_PATH } from '@/lib/routes';

/** Takes someone who has just been signed in to the app. */
export function useEnterApp(): () => void {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    // A session looked up before signing in is stale; the app shell must ask again.
    queryClient.removeQueries({ queryKey: CURRENT_SESSION_QUERY_KEY });
    router.replace(APP_HOME_PATH);
  };
}
