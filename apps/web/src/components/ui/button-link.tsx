import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-foreground text-background',
  outline: 'border',
} as const;

/** A link styled as a button; the one place the call-to-action look is defined. */
export function ButtonLink({
  variant = 'primary',
  className,
  ...props
}: ComponentProps<typeof Link> & { readonly variant?: keyof typeof VARIANTS }) {
  return (
    <Link
      className={cn('inline-block rounded-md px-4 py-2 font-medium', VARIANTS[variant], className)}
      {...props}
    />
  );
}
