'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CURRENT_SESSION_QUERY_KEY } from '@/components/app/use-current-session';
import { FocusedHeading } from '@/components/ui/focused-heading';
import { api } from '@/lib/api';
import { APP_HOME_PATH, SIGN_IN_PATH } from '@/lib/routes';

/**
 * Confirms the token from the emailed link with the API, which signs the user in. It is a
 * POST from the page, never the link itself, so mail scanners that follow links change nothing.
 */
export function EmailVerification() {
  const t = useTranslations('auth.verifyEmail');
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hasFailed, setHasFailed] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    // A token is confirmed once, even when React runs effects twice in development.
    if (hasStarted.current) return;
    hasStarted.current = true;

    void (async () => {
      const { response } = await api.POST('/v1/auth/email-verification', { body: { token } });
      if (!response.ok) {
        setHasFailed(true);
        return;
      }
      // A session looked up before signing in is stale; the app shell must ask again.
      queryClient.removeQueries({ queryKey: CURRENT_SESSION_QUERY_KEY });
      router.replace(APP_HOME_PATH);
    })();
  }, [token, router, queryClient]);

  if (!hasFailed) {
    return (
      <p role="status" className="text-muted-foreground">
        {t('verifying')}
      </p>
    );
  }
  return (
    <section>
      <FocusedHeading>{t('failedHeading')}</FocusedHeading>
      <p className="text-muted-foreground mt-3">{t('failedBody')}</p>
      <Link href={SIGN_IN_PATH} className="mt-6 inline-block underline">
        {t('signInLink')}
      </Link>
    </section>
  );
}
