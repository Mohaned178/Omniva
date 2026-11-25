import { useTranslations } from 'next-intl';

/** Turns an API error code into what the person reads; unknown codes get a calm fallback. */
export function useAuthErrorMessage(): (code: string | undefined) => string {
  const t = useTranslations('auth.errors');
  return (code) => {
    switch (code) {
      case 'INVALID_CREDENTIALS':
        return t('invalidCredentials');
      case 'EMAIL_NOT_VERIFIED':
        return t('emailNotVerified');
      case 'UNTRUSTED_ORIGIN':
        return t('untrustedOrigin');
      case undefined:
      default:
        return t('unexpected');
    }
  };
}
