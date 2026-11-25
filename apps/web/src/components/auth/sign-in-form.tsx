'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SignInRequestSchema, type SignInRequest } from '@omniva/schemas';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { FormField } from '@/components/ui/form-field';
import { api } from '@/lib/api';
import { SIGN_UP_PATH } from '@/lib/routes';
import { useAuthErrorMessage } from './use-auth-error-message';
import { useEnterApp } from './use-enter-app';

export function SignInForm() {
  const t = useTranslations('auth');
  const errorMessage = useAuthErrorMessage();
  const enterApp = useEnterApp();
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
    enterApp();
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
        <Link href={SIGN_UP_PATH} className="underline">
          {t('signIn.signUpLink')}
        </Link>
      </p>
    </section>
  );
}
