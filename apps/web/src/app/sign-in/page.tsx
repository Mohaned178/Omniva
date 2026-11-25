import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.signIn');
  return { title: t('title') };
}

/** Placeholder until the identity ticket adds the real form. */
export default async function SignInPage() {
  const t = await getTranslations('auth');
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-semibold">{t('signIn.heading')}</h1>
      <p className="text-muted-foreground mt-3">{t('signIn.body')}</p>
      <Link href="/" className="mt-6 inline-block underline">
        {t('backHome')}
      </Link>
    </main>
  );
}
