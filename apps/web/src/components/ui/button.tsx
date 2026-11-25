import type { ComponentProps } from 'react';
import { buttonClassName, type ButtonVariant } from './button-styles';

/** A button for actions; it looks the same as ButtonLink. */
export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { readonly variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, `disabled:opacity-60 ${className ?? ''}`)}
      {...props}
    />
  );
}
