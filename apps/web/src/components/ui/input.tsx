import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'bg-background w-full rounded-md border px-3 py-2 text-base',
        'aria-[invalid=true]:border-destructive',
        className,
      )}
      {...props}
    />
  );
}
