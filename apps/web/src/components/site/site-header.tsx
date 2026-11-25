import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button-link';

const NAV = [
  { href: '/features', key: 'features' },
  { href: '/how-it-works', key: 'howItWorks' },
  { href: '/pricing', key: 'pricing' },
  { href: '/privacy', key: 'privacy' },
  { href: '/faq', key: 'faq' },
] as const;

export function SiteHeader() {
  const t = useTranslations('site');
  const app = useTranslations('app');
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          {app('name')}
        </Link>
        <nav aria-label={t('mainNav')}>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {NAV.map(({ href, key }) => (
              <li key={href}>
                <Link href={href} className="hover:underline">
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/sign-in" className="hover:underline">
            {t('signIn')}
          </Link>
          <ButtonLink href="/sign-up" className="px-3 py-1.5">
            {t('getStarted')}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
