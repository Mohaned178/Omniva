import Link from 'next/link';
import type { ComponentProps } from 'react';
import { buttonClassName, type ButtonVariant } from './button-styles';

/** A link styled as a button, for navigation such as a call to action. */
export function ButtonLink({
  variant = 'primary',
  className,
  ...props
}: ComponentProps<typeof Link> & { readonly variant?: ButtonVariant }) {
  return <Link className={buttonClassName(variant, className)} {...props} />;
}
