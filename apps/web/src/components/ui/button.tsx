import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-foreground text-background',
  outline: 'border',
} as const;

/** A button with the same look as ButtonLink, for actions rather than navigation. */
export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { readonly variant?: keyof typeof VARIANTS }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-block rounded-md px-4 py-2 font-medium disabled:opacity-60',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
