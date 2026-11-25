'use client';

import { type ReactNode, useEffect, useRef } from 'react';

/**
 * A page heading that takes focus when it appears, so screen-reader users hear that the
 * screen changed without a navigation.
 */
export function FocusedHeading({ children }: { readonly children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold outline-none">
      {children}
    </h1>
  );
}
