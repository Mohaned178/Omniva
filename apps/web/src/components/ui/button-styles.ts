import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-foreground text-background',
  outline: 'border',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

/** The one place the button look is defined, shared by buttons and links styled as buttons. */
export function buttonClassName(variant: ButtonVariant, className?: string): string {
  return cn('inline-block rounded-md px-4 py-2 font-medium', VARIANTS[variant], className);
}
