import { useCurrentSession } from './use-current-session';

/**
 * The workspace the user is working in: for now always their personal workspace. Only for
 * components inside the app shell, which renders nothing until the session is known.
 */
export function useWorkspaceId(): string {
  const { data: session } = useCurrentSession();
  if (!session) throw new Error('useWorkspaceId() needs a signed-in session');
  return session.personalWorkspace.id;
}
