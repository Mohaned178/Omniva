import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { EmailVerification } from '@/components/auth/email-verification';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.verifyEmail');
  return { title: t('title') };
}

/** Opened from the verification email; the token is read in the browser (ADR 0019). */
export default function VerifyEmailPage() {
  return (
    <Suspense>
      <EmailVerification />
    </Suspense>
  );
}
