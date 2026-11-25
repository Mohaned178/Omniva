'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { SIGN_IN_PATH } from '@/lib/routes';
import { CURRENT_SESSION_QUERY_KEY, useCurrentSession } from './use-current-session';

/**
 * The frame around every app page. It renders nothing of the app until the API confirms a
 * session, and sends anyone without one to sign in (spec, D3; ADR 0019).
 */
export function AppShell({ children }: { readonly children: ReactNode }) {
  const t = useTranslations('appShell');
  const app = useTranslations('app');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isError, isFetching } = useCurrentSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  // Only a settled answer counts: a cached "nobody" may be about to be replaced.
  const hasNoSession = session === null && !isFetching;

  useEffect(() => {
    if (hasNoSession) router.replace(SIGN_IN_PATH);
  }, [hasNoSession, router]);

  async function signOut(): Promise<void> {
    setIsSigningOut(true);
    await api.POST('/v1/auth/sign-out');
    queryClient.removeQueries({ queryKey: CURRENT_SESSION_QUERY_KEY });
    router.replace(SIGN_IN_PATH);
  }

  if (isError) {
    return (
      <p role="alert" className="p-4">
        {t('unavailable')}
      </p>
    );
  }
  if (!session) {
    return (
      <p role="status" className="text-muted-foreground p-4">
        {t('loading')}
      </p>
    );
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="text-lg font-semibold">{app('name')}</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {t('signedInAs', { email: session.user.email })}
            </span>
            <Button
              variant="outline"
              onClick={() => void signOut()}
              disabled={isSigningOut}
              className="py-1.5"
            >
              {t('signOut')}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
