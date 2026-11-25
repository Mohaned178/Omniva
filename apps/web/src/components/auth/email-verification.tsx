'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FocusedHeading } from '@/components/ui/focused-heading';
import { api } from '@/lib/api';
import { SIGN_IN_PATH } from '@/lib/routes';
import { useEnterApp } from './use-enter-app';

/**
 * Confirms the token from the emailed link with the API, which signs the user in. It is a
 * POST from the page, never the link itself, so mail scanners that follow links change nothing.
 */
export function EmailVerification() {
  const t = useTranslations('auth.verifyEmail');
  const token = useSearchParams().get('token') ?? '';
  const enterApp = useEnterApp();
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
      enterApp();
    })();
  }, [token, enterApp]);

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
