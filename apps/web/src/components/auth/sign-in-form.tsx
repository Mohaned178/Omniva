'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SignInRequestSchema, type SignInRequest } from '@omniva/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CURRENT_SESSION_QUERY_KEY } from '@/components/app/use-current-session';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { FormField } from '@/components/ui/form-field';
import { api } from '@/lib/api';
import { APP_HOME_PATH } from '@/lib/routes';
import { useAuthErrorMessage } from './use-auth-error-message';

export function SignInForm() {
  const t = useTranslations('auth');
  const errorMessage = useAuthErrorMessage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInRequest>({ resolver: zodResolver(SignInRequestSchema) });

  async function signIn(values: SignInRequest): Promise<void> {
    setFailure(undefined);
    const { error, response } = await api.POST('/v1/auth/sign-in', { body: values });
    if (!response.ok) {
      setFailure(errorMessage(error?.code));
      return;
    }
    // A session looked up before signing in is stale; the app shell must ask again.
    queryClient.removeQueries({ queryKey: CURRENT_SESSION_QUERY_KEY });
    router.replace(APP_HOME_PATH);
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">{t('signIn.heading')}</h1>
      <form
        noValidate
        onSubmit={(event) => void handleSubmit(signIn)(event)}
        className="mt-8 space-y-5"
      >
        {failure ? <FormAlert>{failure}</FormAlert> : null}
        <FormField
          label={t('email')}
          type="email"
          autoComplete="email"
          error={errors.email ? t('errors.emailInvalid') : undefined}
          {...register('email')}
        />
        <FormField
          label={t('password')}
          type="password"
          autoComplete="current-password"
          error={errors.password ? t('errors.passwordRequired') : undefined}
          {...register('password')}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t('signIn.submitting') : t('signIn.submit')}
        </Button>
      </form>
      <p className="mt-6 text-sm">
        {t('signIn.newHere')}{' '}
        <Link href="/sign-up" className="underline">
          {t('signIn.signUpLink')}
        </Link>
      </p>
    </section>
  );
}
