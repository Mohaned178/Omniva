import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Sign-up, sign-in and verification: one calm column, nothing else to distract. */
export default function AuthLayout({ children }: { readonly children: ReactNode }) {
  const app = useTranslations('app');
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Link href="/" className="text-lg font-semibold">
            {app('name')}
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:py-16">{children}</main>
    </div>
  );
}
