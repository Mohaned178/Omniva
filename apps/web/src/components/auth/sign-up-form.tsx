'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  SignUpRequestSchema,
  type SignUpRequest,
} from '@omniva/schemas';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FocusedHeading } from '@/components/ui/focused-heading';
import { FormAlert } from '@/components/ui/form-alert';
import { FormField } from '@/components/ui/form-field';
import { api } from '@/lib/api';
import { useAuthErrorMessage } from './use-auth-error-message';

export function SignUpForm() {
  const t = useTranslations('auth');
  const errorMessage = useAuthErrorMessage();
  const [sentTo, setSentTo] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpRequest>({ resolver: zodResolver(SignUpRequestSchema) });

  async function signUp(values: SignUpRequest): Promise<void> {
    setFailure(undefined);
    const { error, response } = await api.POST('/v1/auth/sign-up', { body: values });
    if (response.ok) setSentTo(values.email);
    else setFailure(errorMessage(error?.code));
  }

  if (sentTo !== undefined) {
    return (
      <section>
        <FocusedHeading>{t('signUp.checkEmail.heading')}</FocusedHeading>
        <p className="text-muted-foreground mt-3">
          {t('signUp.checkEmail.body', { email: sentTo })}
        </p>
      </section>
    );
  }

  function passwordError(): string | undefined {
    const type = errors.password?.type;
    if (type === undefined) return undefined;
    if (type === 'too_small') return t('errors.passwordTooShort', { min: MIN_PASSWORD_LENGTH });
    if (type === 'too_big') return t('errors.passwordTooLong', { max: MAX_PASSWORD_LENGTH });
    return t('errors.passwordRequired');
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">{t('signUp.heading')}</h1>
      <p className="text-muted-foreground mt-3">{t('signUp.intro')}</p>
      <form
        noValidate
        onSubmit={(event) => void handleSubmit(signUp)(event)}
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
          autoComplete="new-password"
          hint={t('signUp.passwordHint', { min: MIN_PASSWORD_LENGTH })}
          error={passwordError()}
          {...register('password')}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t('signUp.submitting') : t('signUp.submit')}
        </Button>
      </form>
      <p className="mt-6 text-sm">
        {t('signUp.haveLogin')}{' '}
        <Link href="/sign-in" className="underline">
          {t('signUp.signInLink')}
        </Link>
      </p>
    </section>
  );
}
