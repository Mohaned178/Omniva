import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';

/** Public pages: pre-rendered, no session, no user data (ADR 0019). */
export default function PublicLayout({ children }: { readonly children: ReactNode }) {
  const t = useTranslations('site');
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="bg-background sr-only rounded-md p-2 focus:not-sr-only focus:absolute focus:start-2 focus:top-2"
      >
        {t('skipToContent')}
      </a>
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-16">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
